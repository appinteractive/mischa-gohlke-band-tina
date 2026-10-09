import { DEFAULT_SITE_ORIGIN } from './site-url.mjs'

// Copy-paste brings in invisible characters and non-breaking spaces.
const INVISIBLE =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u2028\u2029\u2060\ufeff]/g
const NON_BREAKING_SPACE = /[\u00a0\u202f]/g
// Next.js reads these as redirect patterns; an alias is always a literal path.
const PATTERN_CHARACTERS = /[(){}:*+]/g
const SCHEME = /^[a-z][a-z\d+.-]*:/i

function siteHosts() {
  const hosts = new Set()
  for (const origin of [DEFAULT_SITE_ORIGIN, process.env.SITE_URL]) {
    try {
      const host = new URL(origin).hostname.toLowerCase().replace(/^www\./, '')
      hosts.add(host)
      hosts.add(`www.${host}`)
    } catch {
      // An invalid SITE_URL is reported by siteOrigin().
    }
  }
  return hosts
}

/**
 * Turn an editor-entered alias into a site-relative path, or explain why it
 * cannot be one. Accepts full URLs of this site, which editors often paste.
 */
export function parseAlias(value) {
  if (typeof value !== 'string') return { error: 'Bitte eine URL eingeben.' }
  let alias = value
    .replace(INVISIBLE, '')
    .replace(NON_BREAKING_SPACE, ' ')
    .trim()
  if (!alias) return { error: 'Bitte eine URL eingeben.' }

  const hosts = siteHosts()
  const bareHost = alias.split('/')[0].toLowerCase()
  // `//example.de/x` names a host; `//seite` is a doubled slash.
  const protocolRelative = /^\/\/[^/]*\./.test(alias)
  if (SCHEME.test(alias) || protocolRelative || hosts.has(bareHost)) {
    let url
    try {
      url = new URL(
        SCHEME.test(alias) ? alias : `https://${alias.replace(/^\/\//, '')}`
      )
    } catch {
      return { error: 'Die URL ist ungültig.' }
    }
    if (
      !/^https?:$/.test(url.protocol) ||
      !hosts.has(url.hostname.toLowerCase())
    ) {
      return { error: 'Nur Adressen dieser Website können umgeleitet werden.' }
    }
    alias = url.pathname
  }

  alias = alias.split(/[?#]/)[0]
  if (!alias.startsWith('/')) alias = `/${alias}`
  alias = alias.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  if (/\s/.test(alias)) {
    return { error: 'Die URL darf keine Leerzeichen enthalten.' }
  }
  return { path: alias }
}

/** Tina field validation: a message for the first unusable alias. */
export function validateAliases(value) {
  for (const alias of Array.isArray(value) ? value : [value]) {
    if (alias == null || alias === '') continue
    const { error } = parseAlias(alias)
    if (error) return `${error} (${String(alias).trim()})`
  }
  return undefined
}

/**
 * Redirects for every page's aliases. Unusable aliases are skipped with a
 * warning instead of failing the build. An alias may deliberately replace an
 * existing page (redirects win), so that only warns.
 */
export function aliasRedirects(pages, warn = console.warn) {
  const pagePaths = new Set(pages.map((page) => page.path))
  const sources = new Set()
  const redirects = []
  for (const { path, alias } of pages) {
    for (const value of Array.isArray(alias) ? alias : []) {
      const { path: source, error } = parseAlias(value)
      if (error) {
        warn(`Skipping alias ${JSON.stringify(value)} of ${path}: ${error}`)
        continue
      }
      if (source === path || sources.has(source)) continue
      if (pagePaths.has(source)) {
        warn(`Alias ${source} of ${path} hides the page at that URL`)
      }
      sources.add(source)
      redirects.push({
        source: source.replace(PATTERN_CHARACTERS, '\\$&'),
        destination: path,
        permanent: true,
      })
    }
  }
  return redirects
}
