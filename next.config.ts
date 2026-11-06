import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      {
        protocol: "https",
        hostname: "b257ed6mhc.ufs.sh",
=======
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
      },
    ],
  },
};

export default nextConfig;
