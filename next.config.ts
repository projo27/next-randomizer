
require("dotenv").config();
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
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    GIPHY_API_KEY: process.env.GIPHY_API_KEY,
  },
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
      {
        protocol: "https",
        hostname: "media.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media0.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media1.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media2.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media4.giphy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "coverartarchive.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "coverartarchive.org",
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
