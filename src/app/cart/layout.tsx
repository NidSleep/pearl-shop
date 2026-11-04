import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your pearl jewellery, select delivery to Malaysia or Singapore, and continue to secure checkout.",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
