/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed deprecated appDir setting - Next.js 15 uses App Router by default
  eslint: {
    // Ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 