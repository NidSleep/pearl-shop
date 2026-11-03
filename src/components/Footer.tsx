import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/" className="wordmark">Pearl Shop</Link>
          <p className="mt-4 max-w-xs text-sm leading-7">Pearl jewellery for a life well worn.<br />Malaysia & Singapore. Prices in MYR.</p>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <h2 className="eyebrow">Explore</h2>
          <Link href="/#collection">The collection</Link>
          <Link href="/#about">Our story</Link>
          <Link href="/#pearl-care">Pearl care</Link>
          <Link href="/cart">Your cart</Link>
        </nav>
        <div className="space-y-4 text-sm">
          <h2 className="eyebrow">Thoughtfully yours</h2>
          <p className="leading-7">Gift-ready packaging.<br />Secure checkout via Stripe.</p>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <p>© {new Date().getFullYear()} Pearl Shop. All rights reserved.</p>
        <p>A little lustre. Every day.</p>
      </div>
    </footer>
  );
}
