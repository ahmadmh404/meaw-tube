import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      {
        protocol: "https",
        hostname: "b257ed6mhc.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
