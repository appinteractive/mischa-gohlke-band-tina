import type { ImageLoaderProps } from 'next/image'
import { getTinaStagingFallback } from '@/lib/image-cache'

const MAX_DIMENSION = 3840
const SVG_PATH = /\.svg(?:[?#]|$)/i

export interface CaravaggioUrlOptions extends ImageLoaderProps {
  height?: number
}

function assertIntegerInRange(
  value: number,
  name: string,
  minimum: number,
  maximum: number
) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `${name} must be an integer between ${minimum} and ${maximum}`
    )
  }
}

/** Build a URL for the guarded Caravaggio image endpoint. */
export function caravaggioUrl({
  src,
  width,
  height,
  quality = 75,
}: CaravaggioUrlOptions): string {
  // A missing Tina preview SVG needs the same canonical fallback as raster
  // media, so route staged SVGs through the guarded endpoint as well.
  if (SVG_PATH.test(src) && !getTinaStagingFallback(src)) return src

  assertIntegerInRange(width, 'width', 1, MAX_DIMENSION)
  if (height !== undefined) {
    assertIntegerInRange(height, 'height', 1, MAX_DIMENSION)
  }
  assertIntegerInRange(quality, 'quality', 1, 100)

  return `/api/assets/rs,s:${width}x${
    height ?? ''
  },m:downfit/o:webp/q:${quality}?image=${encodeURIComponent(src)}`
}

export default function caravaggioLoader(props: ImageLoaderProps): string {
  return caravaggioUrl(props)
}
