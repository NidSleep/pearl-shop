import "server-only";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase";

export const ORDER_STATUSES = ["pending", "paid", "failed", "cancelled"] as const;
export const ORDERS_PAGE_SIZE = 50;
type OrderStatus = typeof ORDER_STATUSES[number];
type SearchParams = Record<string, string | string[] | undefined>;

export type AdminOrder = {
  id: string;
  created_at: string;
  status: OrderStatus;
  customer_email: string | null;
  total_cents: number;
  shipping_cents: number;
  amount_paid_cents: number | null;
  currency: string;
  needs_attention: boolean;
  order_items: { quantity: number }[];
};

export function parseOrderFilters(params: SearchParams) {
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const status = first(params.status);
  const rawPage = first(params.page) ?? "1";
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    status: ORDER_STATUSES.includes(status as OrderStatus) ? status as OrderStatus : "" as const,
    page: Number.isSafeInteger(page) && page >= 1 && page <= 1_000_000 ? page : 1,
  };
}

export async function getAdminOrders(params: SearchParams) {
  // Keep authorization beside the privileged read, rather than in a layout
  // which Next can reuse across navigations without running it again.
  await requireAdmin();
  const { status, page } = parseOrderFilters(params);
  let query = getAdminClient().from("orders")
    .select("id, created_at, status, customer_email, total_cents, shipping_cents, amount_paid_cents, currency, needs_attention, order_items(quantity)", { count: "exact" });
  if (status) query = query.eq("status", status);
  const start = (page - 1) * ORDERS_PAGE_SIZE;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + ORDERS_PAGE_SIZE - 1);
  const lastPage = Math.max(1, Math.ceil((count ?? 0) / ORDERS_PAGE_SIZE));
  // A stale bookmark or orders removed between navigations can exceed the
  // available range. PostgREST may return either an empty page or PGRST103.
  if ((error?.code === "PGRST103" && page > 1) || (!error && page > lastPage)) {
    const target = error ? 1 : lastPage;
    redirect(`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(target) })}`);
  }
  if (error) throw new Error("Could not load orders. Please try again.");
  return { orders: (data ?? []) as AdminOrder[], count: count ?? 0, status, page };
}
