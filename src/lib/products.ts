import "server-only";
import { connection } from "next/server";
import { getPublicClient } from "./supabase";
import { PEARL_TYPE_LABELS, type PearlType, type Product } from "./types";

const PRODUCT_COLUMNS =
  "id, slug, name, description, pearl_type, size_mm, luster, origin, price_cents, currency, stock, image_url";

export type ProductFilters = {
  type?: PearlType;
  minCents?: number;
  maxCents?: number;
};

type SearchParams = { [key: string]: string | string[] | undefined };

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** Price in whole ringgit from the URL → integer cents, or undefined if blank/invalid. */
function parseRinggit(value: string): number | undefined {
  if (!/^\d{1,7}$/.test(value)) return undefined;
  return Number(value) * 100;
}

/**
 * Reads `?type=akoya&min=100&max=2000` (prices in RM) from the URL.
 * Unknown or malformed values are ignored rather than trusted.
 */
export function parseProductFilters(params: SearchParams): ProductFilters {
  const type = firstValue(params.type);
  let minCents = parseRinggit(firstValue(params.min));
  let maxCents = parseRinggit(firstValue(params.max));
  if (minCents !== undefined && maxCents !== undefined && minCents > maxCents) {
    [minCents, maxCents] = [maxCents, minCents];
  }

  return {
    type: Object.hasOwn(PEARL_TYPE_LABELS, type) ? (type as PearlType) : undefined,
    minCents,
    maxCents,
  };
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return filters.type !== undefined || filters.minCents !== undefined || filters.maxCents !== undefined;
}

export async function getActiveProducts(filters: ProductFilters = {}): Promise<Product[]> {
  await connection(); // always read fresh stock/prices at request time
  let query = getPublicClient().from("products").select(PRODUCT_COLUMNS);

  if (filters.type) query = query.eq("pearl_type", filters.type);
  if (filters.minCents !== undefined) query = query.gte("price_cents", filters.minCents);
  if (filters.maxCents !== undefined) query = query.lte("price_cents", filters.maxCents);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connection();
  const { data, error } = await getPublicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return (data as Product | null) ?? null;
}
