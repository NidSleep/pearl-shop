import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { PearlImage } from "@/components/PearlImage";
import { Icon } from "@/components/Icon";
import { getActiveProducts, hasActiveFilters, parseProductFilters } from "@/lib/products";
import { PEARL_TYPE_LABELS } from "@/lib/types";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

const categories = [
  { type: "akoya", note: "Classic lustre" },
  { type: "freshwater", note: "Everyday character" },
  { type: "south_sea", note: "A luminous presence" },
  { type: "tahitian", note: "Depth & colour" },
] as const;

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseProductFilters(await searchParams);
  const products = await getActiveProducts(filters);
  const isFiltered = hasActiveFilters(filters);
  const heroProduct = products.find((product) => product.image_url);
  const featured = products.find((product) => product.image_url && product.id !== heroProduct?.id) ?? heroProduct;

  return (
    <>
      {!isFiltered && (
        <section className={`hero full-bleed ${!heroProduct ? "hero-no-image" : ""}`} aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">The pearl collection</p>
            <h1 id="hero-title">Naturally luminous.<br />Entirely you.</h1>
            <p className="hero-intro">A quiet glow. An everyday signature. Discover pearl jewellery to wear your own way.</p>
            <a href="#collection" className="button">Explore the collection <Icon name="arrow" /></a>
            <p className="hero-footnote">Akoya · Freshwater · South Sea · Tahitian</p>
          </div>
          {heroProduct && (
            <Link href={`/products/${heroProduct.slug}`} className="hero-visual" aria-label={`Discover ${heroProduct.name}`}>
              <div className="hero-image">
                <PearlImage src={heroProduct.image_url} alt={heroProduct.name} sizes="(max-width: 767px) 100vw, 60vw" preload />
              </div>
              <span className="hero-caption"><span>{heroProduct.name}</span><span>Discover <Icon name="arrow" className="size-4" /></span></span>
            </Link>
          )}
        </section>
      )}

      <nav className="category-section" aria-label="Shop by pearl type">
        <p className="eyebrow">Discover your pearl</p>
        <div className="category-row">
          {categories.map(({ type, note }) => (
            <Link key={type} href={`/?type=${type}#collection`} className="category-link" aria-current={filters.type === type ? "page" : undefined}>
              <span><span className="category-name">{PEARL_TYPE_LABELS[type]}</span><span className="category-note">{note}</span></span>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
      </nav>

      <section id="collection" className="collection-section" aria-labelledby="collection-title">
        <div className="collection-heading">
          <div>
            <p className="eyebrow">Pieces to make your own</p>
            {isFiltered ? <h1 id="collection-title" className="section-heading">{filters.type ? `${PEARL_TYPE_LABELS[filters.type]} pearls` : "The collection"}</h1> : <h2 id="collection-title" className="section-heading">A little lustre, every day.</h2>}
          </div>
          <p>{products.length} {products.length === 1 ? "piece" : "pieces"}{isFiltered ? " matching your filters" : " to discover"} · MYR</p>
        </div>
        <ProductFilters key={`${filters.type ?? ""}-${filters.minCents ?? ""}-${filters.maxCents ?? ""}`} filters={filters} />
        {products.length === 0 ? (
          <div className="empty-collection">
            <h3 className="font-serif text-3xl">{isFiltered ? "A different pearl awaits" : "Something lovely is on its way"}</h3>
            <p className="mt-3 text-muted">{isFiltered ? "No pieces match these filters. Try a different type or price range." : "Our collection is being prepared. Please visit again soon."}</p>
            {isFiltered && <Link href="/#collection" className="button button-secondary mt-6">View all pieces <Icon name="arrow" /></Link>}
          </div>
        ) : (
          <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>

      {!isFiltered && featured && (
        <section className="featured-strip" aria-labelledby="featured-title">
          <div className="featured-image">
            <PearlImage src={featured.image_url} alt={featured.name} sizes="(max-width: 767px) 100vw, 45vw" />
          </div>
          <div className="editorial-copy">
            <p className="eyebrow">In the spotlight</p>
            <h2 id="featured-title" className="section-heading">A detail that<br />makes it yours.</h2>
            <p>Let the pearls do the talking. Explore the colour, shape and subtle details of {featured.name}.</p>
            <p className="featured-product-name">{featured.name}<span className="tabular-nums">{formatPrice(featured.price_cents, featured.currency)}</span></p>
            <Link href={`/products/${featured.slug}`} className="text-link">Discover this piece <Icon name="arrow" /></Link>
          </div>
        </section>
      )}

      <section id="about" className="about-section" aria-labelledby="about-title">
        <div className="editorial-copy">
          <p className="eyebrow">The Pearl Shop story</p>
          <h2 id="about-title" className="section-heading">Timeless begins<br />with the everyday.</h2>
          <p>A favourite shirt. A familiar place. A piece of jewellery that feels like you. We believe pearls belong in the moments that make up a life.</p>
          <p>Our collection brings together Akoya, freshwater, South Sea and Tahitian pearl jewellery. Find your own expression in their different colours, shapes and lustre.</p>
          <a href="#collection" className="text-link">Find your everyday pearl <Icon name="arrow" /></a>
        </div>
        {heroProduct && <div className="story-image"><PearlImage src={heroProduct.image_url} alt={`A closer look at ${heroProduct.name}`} sizes="(max-width: 767px) 100vw, 50vw" /></div>}
      </section>

      <section id="pearl-care" className="care-section" aria-labelledby="care-title">
        <div className="care-heading"><p className="eyebrow">A little care</p><h2 id="care-title" className="section-heading">Keep the glow.</h2><p>Simple rituals for your pearls, so their natural lustre can be enjoyed for years to come.</p></div>
        <ol className="care-list">
          <li><span className="care-number" aria-hidden="true">01</span><h3>Last on. First off.</h3><p>Put on pearls after perfume and cosmetics. Remove them before swimming, showering or exercise.</p></li>
          <li><span className="care-number" aria-hidden="true">02</span><h3>A gentle finish.</h3><p>After wearing, wipe with a soft cloth. Avoid harsh cleaners and ultrasonic cleaning.</p></li>
          <li><span className="care-number" aria-hidden="true">03</span><h3>A space of their own.</h3><p>Store separately in a soft pouch, away from heat and prolonged direct sunlight.</p></li>
        </ol>
      </section>

      <section className="trust-strip" aria-label="Shopping with Pearl Shop">
        <div className="trust-item"><Icon name="lock" /><div><h2>Secure, simply.</h2><p>Checkout securely via Stripe, in MYR.</p></div></div>
        <div className="trust-item"><Icon name="truck" /><div><h2>Closer to you.</h2><p>MY: {formatPrice(SHIPPING_RULES.MY.feeCents)}, free from {formatPrice(SHIPPING_RULES.MY.freeFromCents)}.<br />SG: {formatPrice(SHIPPING_RULES.SG.feeCents)}, free from {formatPrice(SHIPPING_RULES.SG.freeFromCents)}.</p></div></div>
        <div className="trust-item"><Icon name="gift" /><div><h2>A thoughtful touch.</h2><p>Gift-ready packaging, for you<br />or someone special.</p></div></div>
      </section>
    </>
  );
}
