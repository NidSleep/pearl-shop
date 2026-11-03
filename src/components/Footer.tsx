import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand"><Link href="/" className="wordmark">PEARL SHOP</Link><p>Pearls for your everyday.<br />Malaysia &amp; Singapore. All prices in MYR.</p></div>
        <nav aria-label="Shop" className="footer-links"><h2 className="eyebrow">Shop</h2><Link href="/#collection">All pearls</Link><Link href="/?type=akoya#collection">Akoya</Link><Link href="/?type=freshwater#collection">Freshwater</Link><Link href="/?type=south_sea#collection">South Sea</Link><Link href="/?type=tahitian#collection">Tahitian</Link></nav>
        <nav aria-label="Support" className="footer-links"><h2 className="eyebrow">Support</h2><Link href="/#shipping">Shipping</Link><Link href="/#pearl-care">Pearl care</Link><Link href="/cart">Your cart</Link></nav>
        <nav aria-label="About" className="footer-links"><h2 className="eyebrow">About</h2><Link href="/#about">Our perspective</Link><Link href="/#collection">The collection</Link><p>Natural lustre.<br />Personal style.</p></nav>
      </div>
      <div className="site-container footer-bottom"><p>© {new Date().getFullYear()} Pearl Shop. All rights reserved.</p><p>Malaysia · MYR</p></div>
    </footer>
  );
}

