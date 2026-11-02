import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { getActiveProducts, hasActiveFilters, parseProductFilters } from "@/lib/products";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseProductFilters(await searchParams);
  const products = await getActiveProducts(filters);
  const isFiltered = hasActiveFilters(filters);

  return (
    <div className="space-y-10">
      <section className="space-y-3 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">Timeless Pearls</h1>
        <p className="mx-auto max-w-xl text-stone-600">
          Hand-selected Akoya, freshwater, South Sea and Tahitian pearls.
        </p>
      </section>

      <ProductFilters filters={filters} />

      {products.length === 0 ? (
        <p className="text-center text-stone-500">
          {isFiltered
            ? "No pearls match these filters."
            : "No products yet. Run supabase/seed.sql to add samples."}
        </p>
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
