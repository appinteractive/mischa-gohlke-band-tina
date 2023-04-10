/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: ['assets.tina.io'],
  },
  async rewrites() {
    return [
      /* {
        source: "/",
        destination: "/home",
      }, */
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ]
  },
}

module.exports = nextConfig
