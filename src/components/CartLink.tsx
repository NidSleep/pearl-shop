"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { itemCount, ready } = useCart();
  return (
    <Link href="/cart" className="hover:text-stone-900">
      Cart{ready && itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
