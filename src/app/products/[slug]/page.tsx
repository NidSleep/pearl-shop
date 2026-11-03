import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PearlImage } from "@/components/PearlImage";
import { formatPrice } from "@/lib/money";
import { getProductBySlug } from "@/lib/products";
import { PEARL_TYPE_LABELS } from "@/lib/types";
import { SHIPPING_RULES } from "@/lib/shipping";
import { Icon } from "@/components/Icon";

const getProduct = cache(getProductBySlug);

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Piece not found" };
  const description = product.description ?? `Discover ${product.name} at Pearl Shop. Pearl jewellery with delivery to Malaysia and Singapore.`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Pearl Shop`, description, type: "website", siteName: "Pearl Shop", locale: "en_MY",
      ...(product.image_url ? { images: [{ url: product.image_url, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const specs: [string, string | null][] = [
    ["Pearl type", PEARL_TYPE_LABELS[product.pearl_type]],
    ["Size", product.size_mm ? `${product.size_mm} mm` : null],
    ["Luster grade", product.luster],
    ["Origin", product.origin],
  ];

  return (
    <div className="product-page space-y-6">
      <Link href="/#collection" className="text-link text-muted">
        <Icon name="back" className="size-4" /> Back to the collection
      </Link>
      <div className="product-layout">
        <div className="product-detail-stage"><div className="product-detail-image relative w-full aspect-square overflow-hidden">
          <PearlImage src={product.image_url} alt={product.name} sizes="(max-width: 767px) 100vw, 55vw" preload />
        </div><p className="product-image-caption">{PEARL_TYPE_LABELS[product.pearl_type]}<span>Pearl Shop</span></p></div>
        <div className="product-details space-y-7">
          <div className="space-y-4">
            <h1 className="page-title">{product.name}</h1>
            <p className="text-2xl tabular-nums">{formatPrice(product.price_cents, product.currency)}</p>
            <p className="flex items-center gap-2 text-xs text-muted">{product.stock === 0 ? "Currently sold out" : <><Icon name="check" className="size-4" /> Available to order</>}</p>
          </div>
          {product.description && <p className="product-description">{product.description}</p>}
          <dl className="product-specs" aria-label="Product details">
            {specs
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          <AddToCartButton product={product} />
          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-sm text-muted">Only {product.stock} {product.stock === 1 ? "piece" : "pieces"} available</p>
          )}
          <div className="shipping-note space-y-3 border-t border-stone-200 pt-5">
            <p className="flex items-start gap-3"><Icon name="truck" /><span>Delivery to Malaysia & Singapore.<br />Free shipping from {formatPrice(SHIPPING_RULES.MY.freeFromCents)} (MY) or {formatPrice(SHIPPING_RULES.SG.freeFromCents)} (SG). Shipping is confirmed at checkout.</span></p>
            <p className="flex items-center gap-3"><Icon name="lock" /> Secure checkout via Stripe, in MYR.</p>
            <Link href="/#pearl-care" className="text-link">How to care for your pearls <Icon name="arrow" className="size-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
