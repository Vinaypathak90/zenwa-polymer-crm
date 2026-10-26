/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if there are ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to successfully complete even if there are type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
