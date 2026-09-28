const MAX_DIMENSION = 3840
const OPERATION_PATTERN = /^rs,s:(\d+)x(\d*),m:downfit\/o:webp\/q:(\d+)$/
const TINA_STAGING_PATH = /\/__staging\/[^/]+\/(?:__file\/)?/
const TINA_STAGING_ASSET_PATH = /\/__staging\/[^/]+\/(?:__file\/)?(.+)$/
const UNSAFE_RAW_PATH_SEGMENT =
  /(?:^|\/)(?:(?:\.|%2e){1,2}|[^/]*(?:\\|%5c|%00)[^/]*)(?:\/|$)/i

function tinaAssetUrl(source: string): URL | undefined {
  try {
    const url = new URL(source)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'assets.tina.io' ||
      url.port !== '' ||
      url.username !== '' ||
      url.password !== ''
    ) {
      return undefined
    }
    return url
  } catch {
    return undefined
  }
}

export function getTinaStagingFallback(source: string): string | undefined {
  const url = tinaAssetUrl(source)
  if (!url || !TINA_STAGING_PATH.test(url.pathname)) return undefined

  url.pathname = url.pathname.replace(TINA_STAGING_PATH, '/')
  return url.toString()
}

export function getTinaStagingLocalSource(source: string): string | undefined {
  const rawPath = source.split(/[?#]/, 1)[0]
  if (UNSAFE_RAW_PATH_SEGMENT.test(rawPath)) return undefined

  const url = tinaAssetUrl(source)
  const match = url?.pathname.match(TINA_STAGING_ASSET_PATH)
  if (!match) return undefined

  try {
    const assetPath = decodeURIComponent(match[1])
    const segments = assetPath.split('/')
    if (
      segments.some(
        (segment) =>
          segment === '' ||
          segment === '.' ||
          segment === '..' ||
          segment.includes('\\') ||
          segment.includes('\0')
      )
    ) {
      return undefined
    }

    return `/media/${segments.map(encodeURIComponent).join('/')}`
  } catch {
    return undefined
  }
}

export function isAllowedImageOperation(
  params: string | string[] | undefined
): boolean {
  const operation = Array.isArray(params) ? params.join('/') : params
  if (!operation) return false

  const match = OPERATION_PATTERN.exec(operation)
  if (!match) return false

  const width = Number(match[1])
  const height = match[2] === '' ? undefined : Number(match[2])
  const quality = Number(match[3])

  return (
    width >= 1 &&
    width <= MAX_DIMENSION &&
    (height === undefined || (height >= 1 && height <= MAX_DIMENSION)) &&
    quality >= 1 &&
    quality <= 100
  )
}

export function isAllowedImageSource(source: unknown): source is string {
  if (typeof source !== 'string' || source.length === 0) return false

  if (source.startsWith('/')) {
    if (source.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(source)) {
      return false
    }
    try {
      const url = new URL(source, 'https://local.invalid')
      return (
        url.origin === 'https://local.invalid' &&
        (url.pathname.startsWith('/media/') ||
          url.pathname.startsWith('/_next/static/media/'))
      )
    } catch {
      return false
    }
  }

  return tinaAssetUrl(source) !== undefined
}
