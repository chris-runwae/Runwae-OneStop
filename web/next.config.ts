import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      new URL("https://gratisography.com/**"),
      new URL("https://res.cloudinary.com/**"),
    ],
  },
};

export default nextConfig;
