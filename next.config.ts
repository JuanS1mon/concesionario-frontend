import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://192.168.1.2:3000',
  ],
  images: {
    domains: ['via.placeholder.com', 'res.cloudinary.com'],
  },
};

export default nextConfig;
