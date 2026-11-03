"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY_PER_ITEM, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { SHIPPING_RULES, shippingCents, type ShippingCountry } from "@/lib/shipping";

export default function CartPage() {
  const { items, ready, subtotalCents, setQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<ShippingCountry>("MY");

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The server validates the destination and looks up real prices.
        body: JSON.stringify({
          country,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url; // go to Stripe's hosted payment page
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <Link href="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-serif text-3xl">Your cart</h1>
      <ul className="divide-y divide-stone-200 border-y border-stone-200">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 py-4">
            <div>
              <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-stone-500">{formatPrice(item.priceCents)}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={item.quantity}
                onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                className="rounded border border-stone-300 bg-white px-2 py-1"
                aria-label={`Quantity for ${item.name}`}
              >
                {Array.from({ length: MAX_QUANTITY_PER_ITEM }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button onClick={() => removeItem(item.productId)} className="text-sm text-stone-500 hover:text-rose-700">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-lg">
        <span>Subtotal</span>
        <span>{formatPrice(subtotalCents)}</span>
      </div>
      <div className="space-y-3">
        <label htmlFor="shipping-country" className="block text-sm font-medium">Deliver to</label>
        <select id="shipping-country" value={country} disabled={loading}
          onChange={(event) => setCountry(event.target.value as ShippingCountry)}
          className="w-full rounded border border-stone-300 bg-white px-3 py-2">
          {Object.entries(SHIPPING_RULES).map(([code, rule]) => (
            <option key={code} value={code}>{rule.countryName}</option>
          ))}
        </select>
        <div className="flex justify-between text-sm">
          <span>Estimated shipping</span><span>{formatPrice(shippingCents(country, subtotalCents))}</span>
        </div>
        <p className="text-sm text-stone-500">
          {formatPrice(SHIPPING_RULES[country].feeCents)} flat; free on item subtotals of {formatPrice(SHIPPING_RULES[country].freeFromCents)} or more.
          {" "}Final prices and shipping are confirmed on the payment page. To change country, return to your cart.
        </p>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <button
        onClick={checkout}
        disabled={loading}
        className="w-full rounded-md bg-stone-900 px-6 py-3 text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {loading ? "Redirecting to payment…" : "Checkout"}
      </button>
    </div>
  );
}
