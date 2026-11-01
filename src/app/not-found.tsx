import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="font-serif text-3xl">Page not found</h1>
      <Link href="/" className="underline">
        Back to shop
      </Link>
    </div>
  );
}
