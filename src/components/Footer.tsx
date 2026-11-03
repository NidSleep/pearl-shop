import Link from "next/link";
import { Icon } from "./Icon";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-signoff"><p>Always a little<br /><em>extraordinary.</em></p><Link href="/#collection" className="text-link">Find your pearls <Icon name="arrow" /></Link></div>
      <div className="site-container footer-grid">
        <div>
          <Link href="/" className="wordmark">Pearl Shop<span className="wordmark-dot" aria-hidden="true" /></Link>
          <p className="mt-5 max-w-xs text-sm leading-7">A little lustre for every day.<br />Pearl jewellery, delivered to Malaysia and Singapore.</p>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <h2 className="text-sm font-medium">Explore</h2>
          <Link href="/#collection">The collection</Link>
          <Link href="/#about">Our story</Link>
          <Link href="/#pearl-care">Pearl care</Link>
          <Link href="/cart">Your cart</Link>
        </nav>
        <div className="space-y-4 text-sm">
          <h2 className="font-medium">A thoughtful finishing touch</h2>
          <p className="leading-7">Careful packaging. Simple, secure checkout.</p>
          <p className="text-xs">Malaysia & Singapore · Prices in MYR</p>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <p>© {new Date().getFullYear()} Pearl Shop. All rights reserved.</p>
        <p className="flex items-center gap-2"><Icon name="lock" className="size-4" /> Secure payments via Stripe · MYR</p>
      </div>
    </footer>
  );
}
