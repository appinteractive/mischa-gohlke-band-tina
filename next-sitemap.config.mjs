import { siteOrigin } from './src/lib/site-url.mjs'
import {
  createSitemapTransform,
  robotsPolicies,
} from './src/lib/sitemap-indexing.mjs'
import { readFileSync } from 'node:fs'

// Some legacy aliases are also MDX filenames. Next still prerenders those
// files, but the configured redirect wins at request time.
const redirects = JSON.parse(
  readFileSync('.next/routes-manifest.json', 'utf8')
).redirects.map((redirect) => new RegExp(redirect.regex))

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: siteOrigin(),
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Checkout timestamps are not editorial update dates. Omit lastmod until
  // reliable page-level dates are maintained.
  autoLastmod: false,
  exclude: [
    '/index',
    '/404',
    '/500',
    '/confirm',
    '/success',
    '/admin',
    '/admin/*',
    '/api/*',
  ],
  // A hidden navigation entry is not an indexing policy. Include public pages
  // emitted by Next unless explicitly marked as placeholders; never include
  // redirects, API routes or newsletter helpers.
  transform: createSitemapTransform('.next/server/pages', redirects),
  robotsTxtOptions: {
    policies: robotsPolicies,
  },
}
