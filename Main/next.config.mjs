/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint is not installed/configured in this project (no eslint package,
  // no eslint config file), so `next lint`/build-time linting cannot run
  // without first installing and configuring ESLint — out of scope for this
  // pass. TypeScript build-error checking is enabled (flag removed below).
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
