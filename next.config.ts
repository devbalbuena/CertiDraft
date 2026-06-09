import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  }
};

export default nextConfig;
