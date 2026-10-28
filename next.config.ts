import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.0.0.246",
  ],

  images: {
    qualities: [45, 75],
  },
};

export default nextConfig;