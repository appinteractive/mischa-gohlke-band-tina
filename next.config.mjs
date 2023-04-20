import { globby } from 'globby'
import matter from 'gray-matter'

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
  async redirects() {
    // parse all mdx files and get the alias from the frontmatter inside content/pages
    const pages = await globby('./content/pages/**/*.mdx')
    const redirects = pages.reduce((acc, filePath) => {
      const { data } = matter.read(filePath)
      const alias = data.alias
      if (alias?.length) {
        alias.forEach((source) => {
          const destination = cleanPath(filePath).replace('index', '')
          if (source === destination) return

          acc.push({
            source,
            destination,
            permanent: true,
          })
        })
      }
      return acc
    }, [])
    console.log('redirects', redirects)
    return redirects
  },
}

export default nextConfig
