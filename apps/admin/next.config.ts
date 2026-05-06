import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@runwae/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.convex.cloud" },
    ],
  },
};

export default nextConfig;
