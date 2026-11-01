import Link from "next/link";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

// Note: this page is only a "thank you" screen. The order is marked as paid
// by the Stripe webhook (src/app/api/webhooks/stripe/route.ts), never here,
// because anyone can open this URL.
export default function CheckoutSuccessPage() {
  return (
    <div className="space-y-4 text-center">
      <ClearCartOnMount />
      <h1 className="font-serif text-3xl">Thank you for your order!</h1>
      <p className="text-stone-600">You will receive a confirmation email shortly.</p>
      <Link href="/" className="underline">
        Continue shopping
      </Link>
    </div>
  );
}
