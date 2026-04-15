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
        hostname: 'ops-app-files-prod.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'ijeekuhbatykdomumfjx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
