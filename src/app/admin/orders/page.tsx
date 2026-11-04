import Link from "next/link";
import { getAdminOrders, ORDER_STATUSES, ORDERS_PAGE_SIZE } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/money";

const dateFormat = new Intl.DateTimeFormat("en-MY", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur",
});

export default async function AdminOrders({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orders, count, status, page } = await getAdminOrders(await searchParams);
  const pageUrl = (number: number) => `/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(number) })}`;
  const pages = Math.max(1, Math.ceil(count / ORDERS_PAGE_SIZE));

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">Orders</h1>
        <form action="/admin/logout" method="post">
          <button type="submit" className="button button-secondary">Sign out</button>
        </form>
      </div>
      <form action="/admin/orders" method="get" className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">Order status</label>
          <select id="status" name="status" defaultValue={status} className="field">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </div>
        <button type="submit" className="button">Apply filter</button>
        <p className="py-2 text-sm text-stone-600">{count} {count === 1 ? "order" : "orders"}</p>
      </form>
      <div className="overflow-x-auto rounded-sm border border-stone-200 bg-white" role="region" aria-label="Orders table" tabIndex={0}>
        <table className="w-full text-left text-sm tabular-nums">
          <caption className="sr-only">Customer orders, newest first. Dates use Malaysia time. Items counts units.</caption>
          <thead className="border-b border-stone-200 bg-stone-100 text-stone-700">
            <tr>{["Date (MYT)", "Order", "Status", "Customer email", "Items", "Shipping", "Total"].map((heading, index) => (
              <th key={heading} scope="col" className={`whitespace-nowrap px-4 py-3 font-medium ${index >= 4 ? "text-right" : ""}`}>{heading}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {orders.map((order) => (
              <tr key={order.id} className={order.needs_attention ? "bg-amber-50" : "hover:bg-stone-50"}>
                <td className="whitespace-nowrap px-4 py-4"><time dateTime={order.created_at}>{dateFormat.format(new Date(order.created_at))}</time></td>
                <th scope="row" className="px-4 py-4 font-medium"><span title={order.id}>{order.id.slice(0, 8)}</span></th>
                <td className="px-4 py-4">
                  <span className="status-badge" data-status={order.status}>{order.status}</span>
                  {order.needs_attention && <span className="mt-1 block whitespace-nowrap text-xs font-medium text-amber-900">Needs attention</span>}
                </td>
                <td className="max-w-64 break-words px-4 py-4">{order.customer_email ?? "Not provided"}</td>
                <td className="px-4 py-4 text-right">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right">{formatPrice(order.shipping_cents, order.currency)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right font-medium">{formatPrice(order.amount_paid_cents ?? order.total_cents + order.shipping_cents, order.currency)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">No orders on this page. Try another status or page.</td></tr>}
          </tbody>
        </table>
      </div>
      <nav aria-label="Orders pagination" className="flex items-center justify-between gap-4 text-sm">
        {page > 1 ? <Link href={pageUrl(page - 1)} prefetch={false} className="rounded-md border border-stone-300 px-4 py-2 hover:bg-stone-100">Previous</Link> : <span aria-disabled="true" className="px-4 py-2 text-stone-500">Previous</span>}
        <span className="text-stone-600">Page {page} of {pages}</span>
        {page < pages ? <Link href={pageUrl(page + 1)} prefetch={false} className="rounded-md border border-stone-300 px-4 py-2 hover:bg-stone-100">Next</Link> : <span aria-disabled="true" className="px-4 py-2 text-stone-500">Next</span>}
      </nav>
      <p className="text-xs text-stone-600">Highlighted orders need a stock review. Unpaid totals include estimated shipping.</p>
    </div>
  );
}
