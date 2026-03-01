import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  onDemandEntries: {
    maxInactiveAge: 0,
  },
  allowedDevOrigins: [
    "127.0.0.1:3000",
    "localhost:3000",
    "192.168.1.2:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "auto.mercadolibre.com.ar",
      },
      {
        protocol: "https",
        hostname: "preciosdeautos.com.ar",
      },
      {
        protocol: "https",
        hostname: "www.kavak.com",
      },
      {
        protocol: "https",
        hostname: "www.deruedas.com.ar",
      },
    ],
  },
};

export default nextConfig;
