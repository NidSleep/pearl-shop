import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="font-serif text-3xl">Payment cancelled</h1>
      <p className="text-stone-600">No charge was made. Your cart is still saved.</p>
      <Link href="/cart" className="underline">
        Back to cart
      </Link>
    </div>
  );
}
