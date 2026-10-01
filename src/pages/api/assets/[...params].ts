import type { IncomingMessage } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import caravaggio from 'caravaggio'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-image'
import {
  getTinaStagingFallback,
  getTinaStagingLocalSource,
  isAllowedImageOperation,
  isAllowedImageSource,
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

const imageSourcePlugin = () => ({
  urlTransform: async (url: string, req: IncomingMessage) => {
    if (!url.startsWith('/')) {
      const canonicalFallback = getTinaStagingFallback(url)
      if (!canonicalFallback) return url

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers: { 'user-agent': '' },
          signal: AbortSignal.timeout(5000),
        })
        if (response.ok) return url
      } catch {
        // Continue through the local and canonical fallbacks.
      }

      const localSource = getTinaStagingLocalSource(url)
      if (localSource) {
        const localFallback = absoluteLocalSource(localSource, req)
        try {
          const response = await fetch(localFallback, {
            method: 'HEAD',
            headers: { 'user-agent': '' },
            signal: AbortSignal.timeout(5000),
          })
          if (response.ok) return localFallback
        } catch {
          // Let the canonical Tina URL handle non-local assets.
        }
      }

      return canonicalFallback
    }

    return absoluteLocalSource(url, req)
  },
})

const imageHandler = caravaggio({
  logger: {
    options: {
      level: 'error',
    },
  },
  basePath: '/api/assets',
  whitelist: ['assets.tina.io$'],
  browserCache: `s-maxage=${ONE_DAY * 30}, max-age=${ONE_DAY}`,
  plugins: {
    plugins: [
      {
        name: 'image-source',
        instance: imageSourcePlugin,
      },
    ],
  },
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
    const { width, height = '', quality = '75' } = req.query
    if (
      typeof width !== 'string' ||
      typeof height !== 'string' ||
      typeof quality !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid image operation' })
    }
    operation = [`rs,s:${width}x${height},m:downfit`, 'o:webp', `q:${quality}`]
  }
  if (!isSocial && !isAllowedImageOperation(operation)) {
    return res.status(400).json({ error: 'Invalid image operation' })
  }
  if (!isAllowedImageSource(source)) {
    return res.status(403).json({ error: 'Image source is not allowed' })
  }

  // Older content can reference deleted local uploads. Keep share previews usable.
  if (isSocial && source.startsWith('/') && source !== DEFAULT_SOCIAL_IMAGE) {
    try {
      const response = await fetch(absoluteLocalSource(source, req), {
        method: 'HEAD',
        headers: { 'user-agent': '' },
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) source = DEFAULT_SOCIAL_IMAGE
    } catch {
      source = DEFAULT_SOCIAL_IMAGE
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
    return await imageHandler(req, res)
  } finally {
    req.url = originalUrl
    req.query = originalQuery
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}
