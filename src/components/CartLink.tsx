"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Icon } from "./Icon";

export function CartLink() {
  const { itemCount, ready } = useCart();
  return (
    <Link href="/cart" className="cart-link" aria-label={`Cart${ready ? `, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : ""}`}>
      <Icon name="bag" />
      <span className="hidden md:inline">Cart</span>
      {ready && itemCount > 0 && <span className="cart-count">{itemCount}</span>}
    </Link>
  );
}
