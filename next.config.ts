import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // ถ้าใช้ Supabase Cloud
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        // ถ้าใช้ Supabase Docker หรือ Domain อื่น
        hostname: "avatars.githubusercontent.com", // เผื่อใช้ OAuth (Github)
      },
      {
        // Wildcard (ถ้าไม่ซีเรียสเรื่อง security ใน MVP)
        protocol: "https",
        hostname: "**",
      }
    ]
  }
};

export default nextConfig;
