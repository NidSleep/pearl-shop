import Link from "next/link";
import { CartLink } from "./CartLink";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-2xl tracking-wide text-stone-900">
          Pearl Shop
        </Link>
        <nav className="flex items-center gap-6 text-sm text-stone-600">
          <Link href="/" className="hover:text-stone-900">
            Shop
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
