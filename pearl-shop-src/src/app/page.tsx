import { ProductCard } from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <div className="space-y-10">
      <section className="space-y-3 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">Timeless Pearls</h1>
        <p className="mx-auto max-w-xl text-stone-600">
          Hand-selected Akoya, freshwater, South Sea and Tahitian pearls.
        </p>
      </section>

      {products.length === 0 ? (
        <p className="text-center text-stone-500">No products yet. Run supabase/seed.sql to add samples.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
