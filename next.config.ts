import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow product images hosted in Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  turbopack: {
    rules: {
      // Only compile the Tailwind entry; leave application and font CSS native.
      "tailwind.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
