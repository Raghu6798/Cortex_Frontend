import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this entire 'images' block
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
  },
};

export default nextConfig;
