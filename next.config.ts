
import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* experimental here */
  experimental: {},
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Hanya modifikasi untuk build produksi
    if (!dev) {
      const terserPlugin = config.optimization.minimizer.find(
        (plugin: { constructor: { name: string } }) =>
          plugin.constructor.name === "TerserPlugin",
      );

      if (terserPlugin) {
        terserPlugin.options.exclude = /@runware\/sdk-js/;
      }
    }

    return config;
  },
};

export default withPWA(nextConfig);
