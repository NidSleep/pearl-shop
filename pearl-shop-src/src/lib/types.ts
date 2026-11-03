export type PearlType = "akoya" | "freshwater" | "south_sea" | "tahitian" | "other";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  pearl_type: PearlType;
  size_mm: number | null;
  luster: string | null;
  origin: string | null;
  price_cents: number;
  currency: string;
  stock: number;
  image_url: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl: string | null;
};

export const PEARL_TYPE_LABELS: Record<PearlType, string> = {
  akoya: "Akoya",
  freshwater: "Freshwater",
  south_sea: "South Sea",
  tahitian: "Tahitian",
  other: "Other",
};
