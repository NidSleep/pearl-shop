import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { PEARL_TYPE_LABELS, type Product } from "@/lib/types";
import { PearlImage } from "./PearlImage";
import { Icon } from "./Icon";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      <div className="product-card-image relative overflow-hidden">
        <div className="product-photo-frame"><PearlImage src={product.image_url} alt={product.name} /></div>
        <span className="product-discover" aria-hidden="true"><Icon name="arrow" /></span>
        {product.stock === 0 && <span className="sold-out-badge">Sold out</span>}
      </div>
      <div className="product-card-copy">
        <h3 className="font-serif text-lg leading-snug sm:text-xl">{product.name}</h3>
        <p className="mt-2 text-xs text-muted">
          {PEARL_TYPE_LABELS[product.pearl_type]}
          {product.size_mm ? ` · ${product.size_mm} mm` : ""}
        </p>
        <p className="mt-3 text-sm font-medium tabular-nums">{formatPrice(product.price_cents, product.currency)}</p>
      </div>
    </Link>
  );
}
