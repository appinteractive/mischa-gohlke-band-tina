import { encode } from 'blurhash'
import { promises as fs } from 'fs'

export const generateBlurHash = async (url: string) => {
  if (typeof window === 'undefined') return

  const path = require('path')

  // get path to public folder
  const publicPath = path.join(process.cwd(), 'public')

  // get Uint8ClampedArray image data from file path
  const buffer = new Uint8ClampedArray(await fs.readFile(url))
  const blurhash = encode(buffer, 32, 32, 0, 0) // Generate a 32x

  return blurhash
}
