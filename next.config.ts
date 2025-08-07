import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable experimental features that might cause issues
  experimental: {
  },
  // Ensure environment variables are available at build time
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_LOGIN_USER: process.env.NEXT_PUBLIC_LOGIN_USER,
    NEXT_PUBLIC_LOGIN_PASS: process.env.NEXT_PUBLIC_LOGIN_PASS,
  },
  // Add webpack configuration to avoid Turbopack issues
  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
