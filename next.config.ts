import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly from Cloudinary (bypasses /_next/image).
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
