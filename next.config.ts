import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn.bubble.io',
      },
      {
        protocol: 'https',
        hostname: 'ijeekuhbatykdomumfjx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
