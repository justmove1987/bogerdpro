/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.nwgmedia.com",
      },
      {
        protocol: "https",
        hostname: "static.gorfactory.es",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "catalogo.workteam.com",
      },
      {
        protocol: "https",
        hostname: "assets.ppe-analytics.com",
      },
    ],
  },
};

export default nextConfig;
