export const DEFAULT_SITE_ORIGIN = 'https://www.mischagohlkeband.de'

// Search URLs always use the configured public site, never a preview host.
export function siteOrigin() {
  let url
  try {
    url = new URL(process.env.SITE_URL || DEFAULT_SITE_ORIGIN)
  } catch {
    throw new Error('SITE_URL must be an HTTP(S) URL')
  }
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('SITE_URL must be an HTTP(S) URL')
  }
  return url.origin
}

export function canonicalUrl(origin, route) {
  let path = route.split(/[?#]/)[0]
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    throw new Error('Canonical route must be a site-relative path')
  }
  path = path.replace(/\/+$/, '').replace(/\/index$/, '') || '/'
  return new URL(path, origin).href
}
