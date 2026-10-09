import { globby } from 'globby'
import matter from 'gray-matter'
import { aliasRedirects } from './src/lib/redirect-aliases.mjs'

const cleanPath = (path) => {
  // replace ^content/pages/ and .mdx$
  if (path?.trim() === '') return ''
  try {
    return path.replace(/^\.\/content\/pages/, '').replace(/\.mdx$/, '')
  } catch {
    return ''
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
  async headers() {
    return process.env.VERCEL_ENV === 'preview'
      ? [
          {
            source: '/:path*',
            headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
          },
        ]
      : []
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ]
  },
  async redirects() {
    // Redirect each page's former URLs (frontmatter `alias`) to the page.
    const files = await globby('./content/pages/**/*.mdx')
    const redirects = aliasRedirects(
      files.map((filePath) => ({
        path: cleanPath(filePath).replace(/\/index$/, '') || '/',
        alias: matter.read(filePath).data.alias,
      }))
    )

    // console.log('redirects', redirects)
    return [
      { source: '/index', destination: '/', permanent: true },
      ...redirects.filter((redirect) => redirect.source !== '/index'),
    ]
  },
}

export default nextConfig
