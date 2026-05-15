import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'casa-amarilla-mf.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'tvecwpfftdrzfeprefpl.supabase.co',
      },
    ],
  },
};

export default nextConfig;
