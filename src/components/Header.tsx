import Link from "next/link";
import { CartLink } from "./CartLink";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

export function Header() {
  return (
    <>
    <div className="announcement">Complimentary shipping from {formatPrice(SHIPPING_RULES.MY.freeFromCents)} in MY <span aria-hidden="true">·</span> {formatPrice(SHIPPING_RULES.SG.freeFromCents)} in SG</div>
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="wordmark" aria-label="Pearl Shop home">
          Pearl Shop
        </Link>
        <nav aria-label="Main navigation" className="header-nav">
          <Link href="/#collection" className="nav-link">
            Collection
          </Link>
          <Link href="/#about" className="nav-link header-about">Our story</Link>
          <Link href="/#pearl-care" className="nav-link">Pearl care</Link>
          <CartLink />
        </nav>
      </div>
    </header>
    </>
  );
}
