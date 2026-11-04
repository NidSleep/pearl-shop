"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY_PER_ITEM, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { SHIPPING_RULES, shippingCents, type ShippingCountry } from "@/lib/shipping";
import { PearlImage } from "@/components/PearlImage";
import { Icon } from "@/components/Icon";
import { QuantityControl } from "@/components/QuantityControl";

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

  if (!ready) return <div className="status-page" role="status"><h1 className="page-title">Your cart</h1><p>Gathering your selected pieces…</p></div>;

  if (items.length === 0) {
    return (
      <div className="status-page">
        <div className="status-symbol"><Icon name="bag" /></div>
        <h1 className="page-title">A little room for something lovely.</h1>
        <p>Your cart is empty for now. Explore the collection and find a pearl to make your own.</p>
        <Link href="/#collection" className="button mt-8">
          Discover the collection <Icon name="arrow" />
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="collection-heading mb-8">
        <div><h1 className="page-title">Your cart</h1><p className="mt-3">A few beautiful choices, all in one place.</p></div>
        <Link href="/#collection" className="text-link"><Icon name="back" className="size-4" /> Continue shopping</Link>
      </div>
      <div className="cart-layout">
      <ul className="cart-items" aria-label="Selected pieces">
        {items.map((item) => (
          <li key={item.productId} className="cart-item">
            <Link href={`/products/${item.slug}`} className="cart-thumbnail relative block w-full aspect-square overflow-hidden" tabIndex={-1} aria-hidden="true">
              <PearlImage src={item.imageUrl} alt="" sizes="(max-width: 767px) 96px, (max-width: 1023px) 100px, 136px" />
            </Link>
            <div className="min-w-0">
              <div className="cart-item-heading">
                <div>
                  <Link href={`/products/${item.slug}`} className="font-serif text-lg leading-snug hover:underline">{item.name}</Link>
                  <p className="mt-2 text-xs text-muted">{formatPrice(item.priceCents)} each</p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums">{formatPrice(item.priceCents * item.quantity)}</p>
              </div>
              <div className="cart-item-actions">
                <QuantityControl value={item.quantity} max={MAX_QUANTITY_PER_ITEM} onChange={(quantity) => setQuantity(item.productId, quantity)} name={item.name} disabled={loading} />
                <button type="button" disabled={loading} onClick={() => removeItem(item.productId)} className="remove-button" aria-label={`Remove ${item.name} from cart`}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="summary-card space-y-6" aria-labelledby="summary-title" aria-busy={loading}>
        <h2 id="summary-title" className="font-serif text-2xl">Order summary</h2>
        <div className="summary-row"><span>Subtotal</span><span className="font-medium tabular-nums">{formatPrice(subtotalCents)}</span></div>
      <div className="space-y-3 border-t border-stone-300 pt-5">
        <label htmlFor="shipping-country" className="block text-sm font-medium">Delivery country</label>
        <select id="shipping-country" value={country} disabled={loading}
          onChange={(event) => setCountry(event.target.value as ShippingCountry)}
          className="field">
          {Object.entries(SHIPPING_RULES).map(([code, rule]) => (
            <option key={code} value={code}>{rule.countryName}</option>
          ))}
        </select>
        <div className="summary-row">
          <span>Estimated shipping</span><span className="tabular-nums">{shippingCents(country, subtotalCents) === 0 ? "Complimentary" : formatPrice(shippingCents(country, subtotalCents))}</span>
        </div>
        <p className="text-xs leading-6 text-muted">
          Shipping is calculated by country. {" "}
          {formatPrice(SHIPPING_RULES[country].feeCents)} flat; free on item subtotals of {formatPrice(SHIPPING_RULES[country].freeFromCents)} or more.
          {" "}Final prices and shipping are confirmed on the payment page. To change country, return to your cart.
        </p>
      </div>
      <div className="summary-row border-t border-stone-300 pt-5"><span className="font-medium">Estimated total</span><span className="text-xl font-medium tabular-nums">{formatPrice(subtotalCents + shippingCents(country, subtotalCents))}</span></div>
      {error && <p role="alert" className="error-message">{error}</p>}
      <button
        onClick={checkout}
        disabled={loading}
        className="button w-full"
      >
        {loading ? "Opening secure checkout…" : <>Secure checkout <Icon name="arrow" /></>}
      </button>
      <p role="status" className="text-center text-xs text-muted">{loading ? "Please wait while we take you to Stripe." : <span className="inline-flex items-center gap-2"><Icon name="lock" className="size-4" /> Payments securely processed by Stripe</span>}</p>
      </aside>
      </div>
    </div>
  );
}
