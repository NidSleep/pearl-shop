"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY_PER_ITEM, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";

export default function CartPage() {
  const { items, ready, subtotalCents, setQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only send IDs and quantities. The server looks up real prices.
        body: JSON.stringify({
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
      <p className="text-sm text-stone-500">Shipping and final total are confirmed on the payment page.</p>
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
