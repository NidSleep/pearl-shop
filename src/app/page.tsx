import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { PearlImage } from "@/components/PearlImage";
import { Icon } from "@/components/Icon";
import { getActiveProducts, hasActiveFilters, parseProductFilters } from "@/lib/products";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseProductFilters(await searchParams);
  const products = await getActiveProducts(filters);
  const isFiltered = hasActiveFilters(filters);
  const featured = products.find((product) => product.image_url);
  const companion = products.find((product) => product.image_url && product.id !== featured?.id);

  return (
    <>
      {!isFiltered && <>
        <section className={`hero ${!featured ? "hero-no-image" : ""}`} aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">A little lustre.<br /><em>A lasting<br className="mobile-break" /> impression.</em></h1>
            <div className="hero-intro">
              <p>Pearl jewellery for the everyday and the unforgettable. Find the piece that feels like you.</p>
              <div className="hero-actions">
                <a href="#collection" className="button">Explore the collection <Icon name="arrow" /></a>
              </div>
            </div>
          </div>
          <div className="hero-gallery">
            <div className="hero-aside">
              {companion && (
                <Link href={`/products/${companion.slug}`} className="hero-companion" aria-label={`Discover ${companion.name}`}>
                  <div className="hero-companion-image">
                    <PearlImage src={companion.image_url} alt={companion.name} sizes="(max-width: 767px) 35vw, 22vw" />
                  </div>
                  <span>{companion.name} <Icon name="arrow" className="size-4" /></span>
                </Link>
              )}
              <p className="hero-aside-note">Some things never<br />lose their allure.</p>
            </div>
            {featured && (
              <figure className="hero-figure min-w-0">
                <div className="hero-image">
                  <PearlImage src={featured.image_url} alt={featured.name} sizes="(max-width: 767px) 60vw, 55vw" preload />
                </div>
                <figcaption className="hero-caption">
                  <span className="min-w-0">{featured.name}</span>
                  <Link href={`/products/${featured.slug}`} className="inline-flex shrink-0 items-center gap-2">Discover <Icon name="arrow" className="size-4" /></Link>
                </figcaption>
              </figure>
            )}
          </div>
        </section>
        <div className="trust-strip" aria-label="Shopping with Pearl Shop">
          <div className="trust-item"><Icon name="lock" /><div><strong>A secure finishing step</strong><p>Checkout securely via Stripe</p></div></div>
          <div className="trust-item"><Icon name="truck" /><div><strong>From our shop to your doorstep</strong><p>Free shipping: MY from {formatPrice(SHIPPING_RULES.MY.freeFromCents)} · SG from {formatPrice(SHIPPING_RULES.SG.freeFromCents)}</p></div></div>
          <div className="trust-item"><Icon name="gift" /><div><strong>A little care goes a long way</strong><p>Thoughtfully packed for the journey</p></div></div>
        </div>
      </>}
      <section id="collection" aria-labelledby="collection-title">
        <div className="collection-heading">
          <div>
            {isFiltered ? <h1 id="collection-title" className="section-heading">Find your pearls</h1> : <h2 id="collection-title" className="section-heading">Find your pearls</h2>}
            <p className="mt-3">Quietly elegant. Entirely yours.</p>
          </div>
          <p>{products.length} {products.length === 1 ? "piece" : "pieces"}{isFiltered ? " matching your filters" : " in the collection"}</p>
        </div>
        <ProductFilters filters={filters} />
        {products.length === 0 ? (
          <div className="empty-collection">
            <h3 className="font-serif text-2xl">{isFiltered ? "A different pearl awaits" : "Something lovely is on its way"}</h3>
            <p className="mt-3 text-sm text-muted">{isFiltered ? "No pieces match these filters. Try a different type or price range." : "Our collection is being prepared. Please visit again soon."}</p>
            {isFiltered && <Link href="/#collection" className="button button-secondary mt-6">View all pieces <Icon name="arrow" /></Link>}
          </div>
        ) : (
          <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
      <section id="about" className="about-section" aria-labelledby="about-title">
        <div className="about-heading"><h2 id="about-title" className="section-heading">Beauty in the<br /><em>smallest details.</em></h2><a href="#collection" className="text-link">Find your expression <Icon name="arrow" /></a></div>
        <div className="about-copy space-y-5">
          <p>A soft glow, a subtle colour, a shape with its own character. Pearls bring a quiet kind of beauty to the way we dress.</p>
          <p>Explore Akoya, freshwater, South Sea and Tahitian pearls. Compare each piece’s type, size and details to find your own expression of timeless.</p>
        </div>
      </section>
      <section id="pearl-care" className="care-section" aria-labelledby="care-title">
        <div><h2 id="care-title" className="section-heading">Made to be worn.<br />Worth caring for.</h2><p className="mt-5 max-w-sm">A gentle routine helps preserve your pearls’ natural lustre, so you can enjoy them for years to come.</p></div>
        <ul className="care-list">
          <li><h3>The last thing on, the first thing off</h3><p>Put on pearls after perfume and cosmetics. Remove them before swimming, showering or exercise.</p></li>
          <li><h3>Keep it gentle</h3><p>After wearing, wipe with a soft cloth. Avoid harsh cleaners and ultrasonic cleaning.</p></li>
          <li><h3>A space of their own</h3><p>Store separately in a soft pouch to help prevent scratches. Keep away from heat and prolonged direct sunlight.</p></li>
        </ul>
      </section>
    </>
  );
}
