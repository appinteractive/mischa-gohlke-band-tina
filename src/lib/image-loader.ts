import type { ImageLoaderProps } from 'next/image'
import { getTinaStagingFallback } from '@/lib/image-cache'

const MAX_DIMENSION = 3840
const SVG_PATH = /\.svg(?:[?#]|$)/i

export interface ImageUrlOptions extends ImageLoaderProps {
  height?: number
  fit?: 'cover'
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

/** Build a URL for the guarded image endpoint. */
export function imageUrl({
  src,
  width,
  height,
  fit,
  quality = 75,
}: ImageUrlOptions): string {
  // A missing Tina preview SVG needs the same canonical fallback as raster
  // media, so route staged SVGs through the guarded endpoint as well.
  if (SVG_PATH.test(src) && !getTinaStagingFallback(src)) return src

  assertIntegerInRange(width, 'width', 1, MAX_DIMENSION)
  if (height !== undefined) {
    assertIntegerInRange(height, 'height', 1, MAX_DIMENSION)
  }
  assertIntegerInRange(quality, 'quality', 1, 100)
  if (fit !== undefined && (fit !== 'cover' || height === undefined)) {
    throw new RangeError('cover requires a bounded height')
  }

  return `/api/assets/transform?width=${width}${
    height === undefined ? '' : `&height=${height}`
  }&quality=${quality}${fit ? '&fit=cover' : ''}&src=${encodeURIComponent(src)}`
}

/** Match an existing object-cover box without changing srcset width descriptors. */
export function croppedLoader(ratio: number) {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    throw new RangeError('ratio must be a positive finite number')
  }
  return ({ src, width, quality }: ImageLoaderProps): string =>
    imageUrl({
      src,
      width,
      height: Math.max(1, Math.round(width / ratio)),
      quality,
      fit: 'cover',
    })
}

export default function imageLoader(props: ImageLoaderProps): string {
  return imageUrl(props)
}
