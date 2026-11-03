"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <button disabled className="w-full rounded-md bg-stone-300 px-6 py-3 text-white">
        Sold out
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.price_cents,
          imageUrl: product.image_url,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded-md bg-stone-900 px-6 py-3 text-white transition hover:bg-stone-700"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
