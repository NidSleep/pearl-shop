import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { PearlImage } from "@/components/PearlImage";
import { formatPrice } from "@/lib/money";
import { getProductBySlug } from "@/lib/products";
import { PEARL_TYPE_LABELS } from "@/lib/types";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const specs: [string, string | null][] = [
    ["Pearl type", PEARL_TYPE_LABELS[product.pearl_type]],
    ["Size", product.size_mm ? `${product.size_mm} mm` : null],
    ["Luster grade", product.luster],
    ["Origin", product.origin],
  ];

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Back to shop
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
          <PearlImage src={product.image_url} alt={product.name} />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl">{product.name}</h1>
            <p className="text-2xl text-stone-700">{formatPrice(product.price_cents, product.currency)}</p>
          </div>
          {product.description && <p className="leading-relaxed text-stone-600">{product.description}</p>}
          <dl className="divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {specs
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-stone-500">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          <AddToCartButton product={product} />
          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-sm text-amber-700">Only {product.stock} left</p>
          )}
        </div>
      </div>
    </div>
  );
}
