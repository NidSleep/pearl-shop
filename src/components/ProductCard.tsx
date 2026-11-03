import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { PEARL_TYPE_LABELS, type Product } from "@/lib/types";
import { PearlImage } from "./PearlImage";
import { Icon } from "./Icon";

// Editorial images are AI-generated placeholders to be replaced with real photography.
const lifestyleImages: Record<string, { src: string; alt: string }> = {
  "akoya-classic-strand": { src: "/images/editorial/akoya-everyday.webp", alt: "Akoya pearl necklace styled with a cream shirt" },
  "freshwater-stud-earrings": { src: "/images/editorial/freshwater-studs.webp", alt: "Freshwater pearl stud worn with a black blazer" },
  "south-sea-golden-pendant": { src: "/images/editorial/golden-pendant.webp", alt: "Golden South Sea pearl pendant worn with a black neckline" },
  "tahitian-peacock-bracelet": { src: "/images/editorial/tahitian-bracelet.webp", alt: "Dark Tahitian pearl bracelet worn on a wrist" },
};

const localProductPhotos: Record<string, string> = {
  "akoya-classic-strand": "/images/products/akoya-classic-strand.jpg",
  "freshwater-stud-earrings": "/images/products/freshwater-stud-earrings.jpg",
  "south-sea-golden-pendant": "/images/products/south-sea-golden-pendant.jpg",
  "tahitian-peacock-bracelet": "/images/products/tahitian-peacock-bracelet.jpg",
};

export function ProductCard({ product, lifestyle = false }: { product: Product; lifestyle?: boolean }) {
  const editorial = lifestyle ? lifestyleImages[product.slug] : undefined;
  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      <div className="product-card-image relative overflow-hidden">
        <div className={`product-photo-frame ${editorial ? "product-photo-lifestyle" : ""}`}><PearlImage src={editorial?.src ?? localProductPhotos[product.slug] ?? product.image_url} alt={editorial?.alt ?? product.name} sizes="(max-width: 767px) 50vw, 25vw" /></div>
        {product.stock === 0 && <span className="sold-out-badge">Sold out</span>}
      </div>
      <div className="product-card-copy">
        <h3>{product.name} <Icon name="arrow" className="size-4" /></h3>
        <p className="product-type">
          {PEARL_TYPE_LABELS[product.pearl_type]}
          {product.size_mm ? ` · ${product.size_mm} mm` : ""}
        </p>
        <p className="product-price tabular-nums">{formatPrice(product.price_cents, product.currency)}</p>
      </div>
    </Link>
  );
}
