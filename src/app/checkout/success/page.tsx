import Link from "next/link";
import type { Metadata } from "next";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

// Note: this page is only a "thank you" screen. The order is marked as paid
// by the Stripe webhook (src/app/api/webhooks/stripe/route.ts), never here,
// because anyone can open this URL.
export default function CheckoutSuccessPage() {
  return (
    <div className="status-page">
      <ClearCartOnMount />
      <div className="status-symbol"><Icon name="gift" /></div>
      <h1 className="page-title">Thank you for choosing Pearl Shop.</h1>
      <p>Once your payment is confirmed, we’ll send your order confirmation by email. A little lustre is something to look forward to.</p>
      <div className="status-actions"><Link href="/#collection" className="button">Back to the collection <Icon name="arrow" /></Link><Link href="/#pearl-care" className="text-link">Get to know pearl care</Link></div>
    </div>
  );
}
