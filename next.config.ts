import type { NextConfig } from "next";
import { seoRedirects } from "./src/lib/seo-redirects";

const nextConfig: NextConfig = {
  experimental: {
    // Two root layouts (src/app/(en), src/app/(es)) leave no app-wide
    // not-found boundary; src/app/global-not-found.tsx renders the full 404
    // for unmatched URLs.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn.bubble.io',
      },
      {
        protocol: 'https',
        hostname: 'ops-app-files-prod.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'ijeekuhbatykdomumfjx.supabase.co',
      },
    ],
  },
  async redirects() {
    return seoRedirects;
  },
};

export default nextConfig;
