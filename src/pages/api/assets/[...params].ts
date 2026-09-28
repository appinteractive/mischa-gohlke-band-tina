import type { IncomingMessage } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import caravaggio from 'caravaggio'
import {
  getTinaStagingFallback,
  getTinaStagingLocalSource,
  isAllowedImageOperation,
  isAllowedImageSource,
} from '@/lib/image-cache'

const ONE_DAY = 60 * 60 * 24

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAllowedImageOperation(req.query.params)) {
    return res.status(400).json({ error: 'Invalid image operation' })
  }

  if (!isAllowedImageSource(req.query.image)) {
    return res.status(403).json({ error: 'Image source is not allowed' })
  }

  return imageHandler(req, res)
}

export const config = {
  api: {
    responseLimit: false,
  },
}
