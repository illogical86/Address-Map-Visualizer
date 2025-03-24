/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['maps.googleapis.com'],
  },
  distDir: '.next',
  experimental: {
    appDir: true,
  },
  // Specify the directory where your app code is located
  dir: 'src',
}

module.exports = nextConfig 