import { readFileSync, statSync } from 'fs'
import { join } from 'path'

const cleanPath = (path) => {
  // replace ^content/pages/ and .mdx$
  if (path?.trim() === '') return ''
  try {
    return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
  } catch {
    return ''
  }
}

// create list of disabled pages
// by iterating over all items
// and its children recursively
// and check if the item is disabled
function listDisabledPages(items) {
  const disabledPages = []
  items.forEach((item) => {
    const keys = Object.keys(item)

    let disabled, page, children

    for (const index in keys) {
      const key = keys[index]
      // map key with name *Disabled* to disabled
      if (key.toLowerCase().includes('disabled')) {
        disabled = item[key]
      }
      if (key.toLowerCase().includes('page')) {
        page = item[key]
      }
      if (key.toLowerCase().includes('children')) {
        children = item[key]
      }
    }

    if (disabled) {
      disabledPages.push(cleanPath(page))
    }

    if (children) {
      disabledPages.push(...listDisabledPages(children))
    }
  })
  return disabledPages
}

const mainNavigation = []
const disabledPages = []
async function loadMainNavigation() {
  if (mainNavigation?.length) return mainNavigation

  const { menu } = JSON.parse(
    readFileSync('./config/navigation/main.json', 'utf8')
  )
  mainNavigation.push(...menu)
  disabledPages.push(...listDisabledPages(mainNavigation))
}

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://www.mischagohlkeband.de',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  transform: async (config, path) => {
    // load main navigation from the file
    await loadMainNavigation()

    // custom function to ignore the path
    if (disabledPages.indexOf(path) >= 0) {
      return null
    }

    let lastMod

    // get last modified date from file
    if (config.autoLastmod) {
      try {
        const filePath = join(process.cwd(), 'content', 'pages', path) + '.mdx'
        const stat = statSync(filePath)
        lastMod = new Date(stat.mtime).toISOString()
      } catch (e) {
        console.warn(`Could not read mtime of file: ${path}`)
        lastMod = new Date().toISOString()
      }
    }

    // Use default transformation for all other cases
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: lastMod,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}

export default config
