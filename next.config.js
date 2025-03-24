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
  // Specify the absolute path to the app directory
  dir: 'src',
  // Add this to ensure Next.js finds the app directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Add this to specify the root directory
  rootDir: '.',
  // Add this to specify the source directory
  sourceDir: 'src',
}

module.exports = nextConfig 