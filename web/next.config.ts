import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      new URL("https://gratisography.com/**"),
      new URL("https://res.cloudinary.com/**"),
      new URL("pv4jymxwis.ufs.sh"),
    ],
  },
};

export default nextConfig;
