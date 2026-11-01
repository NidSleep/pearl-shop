import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { PEARL_TYPE_LABELS, type Product } from "@/lib/types";
import { PearlImage } from "./PearlImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
        <PearlImage src={product.image_url} alt={product.name} />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          {PEARL_TYPE_LABELS[product.pearl_type]}
          {product.size_mm ? ` · ${product.size_mm}mm` : ""}
        </p>
        <h3 className="font-serif text-lg text-stone-900 group-hover:underline">{product.name}</h3>
        <p className="text-stone-700">{formatPrice(product.price_cents, product.currency)}</p>
        {product.stock === 0 && <p className="text-sm text-rose-700">Sold out</p>}
      </div>
    </Link>
  );
}
