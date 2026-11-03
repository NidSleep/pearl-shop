import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { siteUrl } from "@/lib/env";
import "./tailwind.css";
import "./globals.css";

const sans = localFont({
  src: "./fonts/Montserrat-Latin.woff2", weight: "100 900", style: "normal",
  variable: "--font-ui", display: "swap", fallback: ["Arial", "sans-serif"],
});
const serif = localFont({
  src: "./fonts/EBGaramond-Regular.woff2", weight: "400", style: "normal",
  variable: "--font-display", display: "swap", fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Pearl Shop | Timeless Pearl Jewellery", template: "%s | Pearl Shop" },
  description: "Discover Akoya, freshwater, South Sea and Tahitian pearl jewellery. Shop in MYR with secure Stripe checkout and delivery across Malaysia and Singapore.",
  openGraph: {
    title: "Pearl Shop | Timeless Pearl Jewellery",
    description: "Naturally luminous. Entirely you. Explore pearl jewellery with delivery to Malaysia and Singapore.",
    siteName: "Pearl Shop",
    locale: "en_MY",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ivory text-ink">
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
