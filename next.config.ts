/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t.me" },
      { protocol: "https", hostname: "telegram.org" },
    ],
  },
};

export default nextConfig;
