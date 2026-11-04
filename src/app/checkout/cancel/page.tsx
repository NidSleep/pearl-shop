import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Checkout paused", robots: { index: false, follow: false } };

export default function CheckoutCancelPage() {
  return (
    <div className="status-page">
      <div className="status-symbol"><Icon name="bag" /></div>
      <h1 className="page-title">Take your time.</h1>
      <p>Checkout was cancelled. Your selected pieces are still in your cart, ready whenever you are.</p>
      <div className="status-actions"><Link href="/cart" className="button">Return to your cart <Icon name="arrow" /></Link><Link href="/#collection" className="text-link">Continue exploring</Link></div>
    </div>
  );
}
