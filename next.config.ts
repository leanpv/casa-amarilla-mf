import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'casa-amarilla-mf.vercel.app',
      },
    ],
  },
};

export default nextConfig;
