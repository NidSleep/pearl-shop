import "server-only";
import { connection } from "next/server";
import { getPublicClient } from "./supabase";
import type { Product } from "./types";

const PRODUCT_COLUMNS =
  "id, slug, name, description, pearl_type, size_mm, luster, origin, price_cents, currency, stock, image_url";

export async function getActiveProducts(): Promise<Product[]> {
  await connection(); // always read fresh stock/prices at request time
  const { data, error } = await getPublicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });

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
