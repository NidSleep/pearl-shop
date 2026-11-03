import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Pearl Shop | Timeless Pearl Jewellery", template: "%s | Pearl Shop" },
  description: "Discover Akoya, freshwater, South Sea and Tahitian pearl jewellery. Shop in MYR with secure Stripe checkout and delivery across Malaysia and Singapore.",
  openGraph: {
    title: "Pearl Shop | Timeless Pearl Jewellery",
    description: "A little lustre. A lasting impression. Explore pearl jewellery with delivery to Malaysia and Singapore.",
    siteName: "Pearl Shop",
    locale: "en_MY",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Header />
          <main id="main-content" tabIndex={-1} className="site-container main-content flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
