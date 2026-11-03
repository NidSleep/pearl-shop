"use client";

import { useState } from "react";
import Link from "next/link";
import { MAX_QUANTITY_PER_ITEM, useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { QuantityControl } from "./QuantityControl";
import { Icon } from "./Icon";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items, ready } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const inCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, Math.min(product.stock, MAX_QUANTITY_PER_ITEM) - inCart);
  const selectedQuantity = Math.min(quantity, remaining);

  if (product.stock === 0) {
    return (
      <div className="purchase-controls"><button disabled className="button w-full">Sold out</button></div>
    );
  }

  return (
    <div>
      <div className="purchase-controls">
        <div className="shrink-0">
          <span className="quantity-label mb-2 block text-xs text-muted">Quantity</span>
          <QuantityControl value={remaining > 0 ? selectedQuantity : quantity} max={remaining} onChange={(value) => { setQuantity(value); setAdded(false); }} name={product.name} disabled={!ready || remaining === 0} />
        </div>
        <button
          type="button"
          disabled={!ready || remaining === 0}
          onClick={() => {
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.price_cents,
              imageUrl: product.image_url,
            }, selectedQuantity);
            setAdded(true);
          }}
          className="button min-w-0 flex-1"
        >
          {added ? <><Icon name="check" /> Added to cart</> : remaining === 0 ? "Cart limit reached" : "Add to cart"}
        </button>
      </div>
      <p role="status" className="mt-3 text-xs text-muted">{added ? <>Your selection is in your cart. <Link href="/cart" className="underline">View cart</Link></> : remaining === 0 && ready ? "Your cart has the available quantity for this piece." : `Up to ${Math.min(product.stock, MAX_QUANTITY_PER_ITEM)} per order. Final availability is confirmed at checkout.`}</p>
    </div>
  );
}
