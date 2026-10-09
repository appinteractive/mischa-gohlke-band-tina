import { siteOrigin } from '@/lib/site-url.mjs'
import { isAllowedImageSource } from '@/lib/image-cache'

export const SOCIAL_IMAGE_WIDTH = 1200
export const SOCIAL_IMAGE_HEIGHT = 630
export const DEFAULT_SOCIAL_IMAGE = '/media/mgb titelbild.jpg'

/** Resolve at build time, then pass as a prop so hydration uses the same host. */
export function socialImageOrigin(): string {
  const deployment = process.env.VERCEL_URL
  const origin =
    process.env.VERCEL_ENV === 'preview' && deployment
      ? `https://${deployment}`
      : siteOrigin()
  return new URL(origin).origin
}

export function socialImageUrl(origin: string, source?: string | null): string {
  const image = isAllowedImageSource(source) ? source : DEFAULT_SOCIAL_IMAGE
  return new URL(
    `/api/assets/social?v=2&src=${encodeURIComponent(image)}`,
    origin
  ).toString()
}
