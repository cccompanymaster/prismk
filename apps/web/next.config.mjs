/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@prism-k/data", "@prism-k/types"],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
