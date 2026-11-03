import Link from "next/link";
import { CartLink } from "./CartLink";

export function Header() {
  return (
    <header className="site-header sticky top-0 z-30">
      <div className="site-container header-inner">
        <Link href="/" className="wordmark" aria-label="Pearl Shop home">
          Pearl Shop<span className="wordmark-dot" aria-hidden="true" />
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
  );
}
