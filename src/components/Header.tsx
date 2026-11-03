import Link from "next/link";
import { CartLink } from "./CartLink";
import { Icon } from "./Icon";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatPrice } from "@/lib/money";

const navigation = [
  ["All pearls", "/#collection"],
  ["Akoya", "/?type=akoya#collection"],
  ["Freshwater", "/?type=freshwater#collection"],
  ["South Sea", "/?type=south_sea#collection"],
  ["Tahitian", "/?type=tahitian#collection"],
  ["Pearl care", "/#pearl-care"],
] as const;

export function Header() {
  return (
    <>
      <div className="announcement">Complimentary shipping from {formatPrice(SHIPPING_RULES.MY.freeFromCents)} in Malaysia <span aria-hidden="true">·</span> {formatPrice(SHIPPING_RULES.SG.freeFromCents)} in Singapore</div>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/#collection-search" className="header-search" aria-label="Find your pearl — filter the collection by type and price"><Icon name="search" /><span>Find your pearl</span></Link>
          <Link href="/" className="wordmark" aria-label="Pearl Shop home">PEARL SHOP</Link>
          <CartLink />
        </div>
        <nav aria-label="Main navigation" className="site-container header-nav">{navigation.map(([label, href]) => <Link key={label} href={href} className="nav-link">{label}</Link>)}</nav>
      </header>
    </>
  );
}

