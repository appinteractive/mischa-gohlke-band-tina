import type { IncomingMessage } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import caravaggio, { type Config } from 'caravaggio'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-image'
import {
  getTinaStagingFallback,
  getTinaStagingLocalSource,
  isAllowedImageOperation,
  isAllowedImageSource,
  withoutTinaQuery,
  youtubeThumbnailUrl,
} from '@/lib/image-cache'

const ONE_DAY = 60 * 60 * 24
// Fixed canvas preserves the entire teaser, including text and portrait images.
const SOCIAL_OPERATION = ['rs,s:1200x630,m:social', 'o:jpeg', 'q:85']

function absoluteLocalSource(url: string, req: IncomingMessage): string {
  const deploymentUrl = process.env.VERCEL_URL
  const host = req.headers.host
  if (!deploymentUrl && !host) {
    throw new Error('Cannot resolve the local image host')
  }

  const base = deploymentUrl
    ? deploymentUrl.startsWith('http')
      ? deploymentUrl
      : `https://${deploymentUrl}`
    : `http://${host}`
  const absolute = new URL(url, base)

  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypass) {
    absolute.searchParams.set('x-vercel-protection-bypass', bypass)
  }

  return absolute.toString()
}

/**
 * Whether `url` serves an image. A missing file can be answered with an HTML
 * page, so only image responses count. Tina's asset host answers HEAD with 404
 * for staged files it does serve; probe it with a one-byte GET instead.
 */
async function servesImage(url: string, method: 'HEAD' | 'GET') {
  try {
    const response = await fetch(url, {
      method,
      headers:
        method === 'GET'
          ? { 'user-agent': '', range: 'bytes=0-0' }
          : { 'user-agent': '' },
      signal: AbortSignal.timeout(5000),
    })
    await response.body?.cancel()
    return (
      response.ok &&
      Boolean(response.headers.get('content-type')?.startsWith('image/'))
    )
  } catch {
    return false
  }
}

const imageSourcePlugin = () => ({
  urlTransform: async (source: string, req: IncomingMessage) => {
    if (!source.startsWith('/')) {
      const youtube = youtubeThumbnailUrl(source)?.toString()
      if (youtube) {
        // Not every video has a maxres still; hqdefault always exists.
        return youtube.endsWith('/maxresdefault.jpg') &&
          !(await servesImage(youtube, 'GET'))
          ? youtube.replace(/\/maxresdefault\.jpg$/, '/hqdefault.jpg')
          : youtube
      }
      const url = withoutTinaQuery(source)
      const canonicalFallback = getTinaStagingFallback(url)
      if (!canonicalFallback) return url

      if (await servesImage(url, 'GET')) return url

      const localSource = getTinaStagingLocalSource(url)
      if (localSource) {
        const localFallback = absoluteLocalSource(localSource, req)
        if (await servesImage(localFallback, 'HEAD')) return localFallback
      }

      return canonicalFallback
    }

    return absoluteLocalSource(source, req)
  },
})

const imageConfig = {
  logger: {
    options: {
      level: 'error',
    },
  },
  basePath: '/api/assets',
  whitelist: ['assets.tina.io$', 'i.ytimg.com$', 'img.youtube.com$'],
  browserCache: `s-maxage=${ONE_DAY * 30}, max-age=${ONE_DAY}`,
  plugins: {
    plugins: [
      {
        name: 'image-source',
        instance: imageSourcePlugin,
      },
    ],
  },
} satisfies Config

const imageHandler = caravaggio(imageConfig)

// Substitute images must not be pinned by browsers or CDNs.
const fallbackImageHandler = caravaggio({
  ...imageConfig,
  browserCache: 'no-store',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const params = req.query.params
  const isTransform =
    Array.isArray(params) && params.length === 1 && params[0] === 'transform'
  const isSocial =
    Array.isArray(params) && params.length === 1 && params[0] === 'social'
  let operation = params
  let source = isTransform || isSocial ? req.query.src : req.query.image
  if (isSocial) {
    operation = SOCIAL_OPERATION
  } else if (isTransform) {
    const { width, height = '', quality = '75', fit } = req.query
    if (
      typeof width !== 'string' ||
      typeof height !== 'string' ||
      typeof quality !== 'string' ||
      (fit !== undefined && fit !== 'cover') ||
      (fit === 'cover' && height === '')
    ) {
      return res.status(400).json({ error: 'Invalid image operation' })
    }
    operation = [
      `rs,s:${width}x${height},m:${fit === 'cover' ? 'fill' : 'downfit'}`,
      'o:webp',
      `q:${quality}`,
    ]
  }
  if (!isSocial && !isAllowedImageOperation(operation)) {
    return res.status(400).json({ error: 'Invalid image operation' })
  }
  if (!isAllowedImageSource(source)) {
    return res.status(403).json({ error: 'Image source is not allowed' })
  }

  // Older content can reference deleted local uploads. Keep share previews usable,
  // but never cache the substitute: the check may have failed only temporarily.
  let handler = imageHandler
  if (isSocial && source.startsWith('/') && source !== DEFAULT_SOCIAL_IMAGE) {
    if (!(await servesImage(absoluteLocalSource(source, req), 'HEAD'))) {
      source = DEFAULT_SOCIAL_IMAGE
      handler = fallbackImageHandler
    }
  }

  // Keep the processing syntax on the server; accept old URLs for cached pages.
  const originalUrl = req.url
  const originalQuery = req.query
  req.url = `/api/assets/${
    Array.isArray(operation) ? operation.join('/') : operation
  }?image=${encodeURIComponent(source)}`
  req.query = { image: source }
  try {
    return await handler(req, res)
  } finally {
    req.url = originalUrl
    req.query = originalQuery
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
  // Source probes and downloads are each bounded to 5 s, then Sharp resizes;
  // the project's 5 s function default would cut off share images.
  maxDuration: 30,
}
