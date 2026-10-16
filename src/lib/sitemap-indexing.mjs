import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Use the prerendered CMS snapshot, rather than source frontmatter, so sitemap
// policy agrees with the HTML even when Tina supplies the build's content.
export function createSitemapTransform(pagesDirectory, redirects) {
  return async (_config, path) => {
    if (redirects.some((redirect) => redirect.test(path))) return null

    const filename = path === '/' ? 'index' : path.slice(1)
    const snapshot = JSON.parse(
      readFileSync(join(pagesDirectory, `${filename}.json`), 'utf8')
    )
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new Error(`Invalid prerendered page snapshot: ${path}`)
    }
    const page = snapshot.pageProps?.data?.page
    if (!page || typeof page !== 'object' || Array.isArray(page)) {
      throw new Error(`Missing CMS page in prerendered snapshot: ${path}`)
    }
    if (page.isPlaceholder === true) return null

    return { loc: path, trailingSlash: path === '/' }
  }
}

// Pages reference every raster and share image through /api/assets/, so keep
// those crawlable while excluding the other API routes and the editor.
export const robotsPolicies = [
  {
    userAgent: '*',
    allow: ['/', '/api/assets/'],
    disallow: ['/api/', '/admin/'],
  },
]
