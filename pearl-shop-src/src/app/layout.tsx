import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pearl Shop",
  description: "Fine pearl jewellery, delivered across Malaysia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
            © {new Date().getFullYear()} Pearl Shop
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
