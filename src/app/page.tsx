import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Icon } from "@/components/Icon";
import { getActiveProducts, hasActiveFilters, parseProductFilters } from "@/lib/products";
import { PEARL_TYPE_LABELS } from "@/lib/types";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

// Editorial images are AI-generated placeholders to be replaced with real photography.
const pearlEdits = [
  { type: "akoya", image: "akoya-everyday", title: "The everyday classic", note: "White pearls. A quiet kind of presence.", alt: "White Akoya pearls worn with an open cream shirt" },
  { type: "freshwater", image: "freshwater-studs", title: "A little light", note: "Freshwater pearls, from morning onwards.", alt: "Close-up of a woman wearing a white freshwater pearl stud" },
  { type: "south_sea", image: "golden-pendant", title: "A golden moment", note: "The warm glow of South Sea pearls.", alt: "A golden South Sea pearl pendant worn with a black neckline" },
  { type: "tahitian", image: "tahitian-bracelet", title: "After hours", note: "Dark Tahitian pearls. Unexpected colour.", alt: "Dark Tahitian pearl bracelet on a woman's wrist" },
] as const;

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filters = parseProductFilters(await searchParams);
  const products = await getActiveProducts(filters);
  const isFiltered = hasActiveFilters(filters);

  return (
    <>
      {!isFiltered && (
        <section className="v4-hero" aria-labelledby="hero-title">
          <div className="v4-hero-copy">
            <p className="eyebrow">Pearls, in a new light</p>
            <h1 id="hero-title">Fine<br />pearl<br />collection</h1>
            <p>A natural lustre. A personal signature.<br />Pearl jewellery for the way you live.</p>
            <a href="#collection" className="button button-outline">Explore the collection <Icon name="arrow" /></a>
          </div>
          <div className="v4-hero-photo">
            <Image src="/images/editorial/hero-akoya.webp" alt="A woman wearing a classic white pearl strand with a black square neckline" fill sizes="(max-width: 767px) 100vw, 42vw" preload />
            <span className="v4-photo-note">The art of wearing pearls</span>
          </div>
        </section>
      )}

      <section id="collection" className={`v4-collection ${isFiltered ? "v4-collection-filtered" : ""}`} aria-labelledby="collection-title">
        <div className="v4-section-top">
          {isFiltered ? <h1 id="collection-title" className="v4-sans-heading">{filters.type ? `${PEARL_TYPE_LABELS[filters.type]} pearls` : "All pearls"}</h1> : <h2 id="collection-title" className="v4-sans-heading">New in</h2>}
          <p>{isFiltered ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} matching your selection. Prices in MYR.` : <>Meet your next signature.<br />Discover our collection of cultured pearls.</>}</p>
          <a href="#collection-search" className="text-link v4-filter-shortcut">Find a piece <Icon name="plus" className="size-4" /></a>
        </div>
        <details className="v4-filters" open={isFiltered || undefined}>
          <summary id="collection-search">Filter by pearl type &amp; price <Icon name="plus" className="size-4" /></summary>
          <ProductFilters key={`${filters.type ?? ""}-${filters.minCents ?? ""}-${filters.maxCents ?? ""}`} filters={filters} />
        </details>
        {products.length === 0 ? (
          <div className="empty-collection">
            <h3 className="font-serif text-3xl">{isFiltered ? "A different pearl awaits" : "Something lovely is on its way"}</h3>
            <p className="mt-3 text-muted">{isFiltered ? "No pieces match these filters. Try a different type or price range." : "Our collection is being prepared. Please visit again soon."}</p>
            {isFiltered && <Link href="/#collection" className="button button-secondary mt-6">View all pieces <Icon name="arrow" /></Link>}
          </div>
        ) : (
          <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} lifestyle={!isFiltered && index % 2 === 1} />)}</div>
        )}
        <div className="v4-show-all"><Link href="/?type=#collection" className="text-link">Show all pearls <Icon name="arrow" className="size-4" /></Link></div>
      </section>

      {!isFiltered && (
        <>
          <section className="v4-find" aria-labelledby="find-title">
            <div className="v4-editorial-top">
              <div><h2 id="find-title" className="v4-serif-heading">Find your pearl</h2><p>A different mood. A different kind of lustre.</p></div>
              <a href="#collection" className="text-link">Explore all pearls <Icon name="arrow" className="size-4" /></a>
            </div>
            <div className="v4-edit-grid">
              {pearlEdits.map((edit) => (
                <Link key={edit.type} href={`/?type=${edit.type}#collection`} className="v4-edit">
                  <div className="v4-edit-photo"><Image src={`/images/editorial/${edit.image}.webp`} alt={edit.alt} fill sizes="(max-width: 767px) 50vw, 25vw" /></div>
                  <p className="v4-edit-type">{PEARL_TYPE_LABELS[edit.type]}</p>
                  <h3>{edit.title}</h3><p className="v4-edit-note">{edit.note}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="v4-banner-grid" aria-label="Discover Akoya and South Sea pearls">
            <Link href="/?type=akoya#collection" className="v4-category-banner">
              <Image src="/images/editorial/akoya-evening.webp" alt="Evening portrait of a woman wearing a white Akoya pearl necklace" fill sizes="50vw" />
              <div className="v4-banner-copy"><p className="eyebrow">A timeless silhouette</p><h2>Akoya Strands</h2><span className="v4-shop-button">Shop now</span></div>
            </Link>
            <Link href="/?type=south_sea#collection" className="v4-category-banner">
              <Image src="/images/editorial/south-sea-evening.webp" alt="Evening portrait of a woman wearing a golden South Sea pearl pendant" fill sizes="50vw" />
              <div className="v4-banner-copy"><p className="eyebrow">One luminous detail</p><h2>South Sea Pendants</h2><span className="v4-shop-button">Shop now</span></div>
            </Link>
          </section>

          <section id="about" className="v4-story" aria-labelledby="about-title">
            <p className="eyebrow">The Pearl Shop perspective</p>
            <h2 id="about-title" className="v4-serif-heading">For all the days<br />that make a life.</h2>
            <p>We believe pearls belong in your everyday. With a favourite shirt, for a quiet evening, or a moment worth dressing for. Discover Akoya, freshwater, South Sea and Tahitian pearls, and find the piece that feels like you.</p>
            <a href="#collection" className="text-link">Make it your own <Icon name="arrow" className="size-4" /></a>
          </section>

          <section className="v4-care-feature full-bleed" aria-labelledby="care-feature-title">
            <Image src="/images/editorial/care-after-dark.webp" alt="Pearl stud and necklace softly lit against dark silk" fill sizes="100vw" />
            <div className="v4-feature-copy"><p className="eyebrow">The pearl care edit</p><h2 id="care-feature-title">A little care.<br />A lasting lustre.</h2><p>Simple rituals for the pieces you love.</p><a href="#pearl-care" className="v4-shop-button">Discover pearl care <Icon name="arrow" className="size-4" /></a></div>
          </section>
        </>
      )}

      <section id="pearl-care" className="v4-care" aria-labelledby="care-title">
        <div className="v4-editorial-top"><h2 id="care-title" className="v4-serif-heading">Keep the glow.</h2><p>Three simple habits for your pearls.</p></div>
        <ol className="care-list">
          <li><span className="care-number" aria-hidden="true">01</span><h3>Last on. First off.</h3><p>Put on pearls after perfume and cosmetics. Remove them before swimming, showering or exercise.</p></li>
          <li><span className="care-number" aria-hidden="true">02</span><h3>A gentle finish.</h3><p>After wearing, wipe with a soft cloth. Avoid harsh cleaners and ultrasonic cleaning.</p></li>
          <li><span className="care-number" aria-hidden="true">03</span><h3>A space of their own.</h3><p>Store separately in a soft pouch, away from heat and prolonged direct sunlight.</p></li>
        </ol>
      </section>

      <section id="shipping" className="v4-service-strip" aria-label="Delivery and checkout">
        <div><Icon name="truck" /><p><strong>Malaysia &amp; Singapore</strong><span>MY: {formatPrice(SHIPPING_RULES.MY.feeCents)}, free from {formatPrice(SHIPPING_RULES.MY.freeFromCents)}.<br />SG: {formatPrice(SHIPPING_RULES.SG.feeCents)}, free from {formatPrice(SHIPPING_RULES.SG.freeFromCents)}.</span></p></div>
        <div><Icon name="lock" /><p><strong>Secure checkout</strong><span>Pay securely via Stripe.<br />All prices in Malaysian ringgit.</span></p></div>
      </section>
    </>
  );
}

