import { encode } from 'blurhash'
import { promises as fs } from 'fs'
import sizeOf from 'image-size'

export const generateBlurHash = async (url: string) => {
  try {
    // get path to public folder
    let path = require('path')
    const filePath = path.join(process.cwd(), 'public', url)
    // console.log('url', filePath)

    // get Uint8ClampedArray image data from file path
    let file = await fs.readFile(filePath)

    // Get image dimensions using image-size module
    const { width, height } = await sizeOf(file)
    const resizeFactor = 0.1
    const newWidth = Math.round(width * resizeFactor)
    const newHeight = Math.round(height * resizeFactor)

    let sharp = require('sharp')
    // get size of image under filePath
    let { data, info } = await sharp(filePath)
      .resize(newWidth, newHeight)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true })

    // Check if the resized image dimensions match the expected dimensions
    if (info.width !== newWidth || info.height !== newHeight) {
      console.error('Unexpected image dimensions')
      return
    }

    // Encode the pixel data array into a blurhash
    const blurhash = encode(data, newWidth, newHeight, 4, 3)

    // Clean up
    data = info = sharp = file = path = null

    return blurhash
  } catch (err) {
    console.error(err)
  }

  return null
}

export const addBlurHash = async (node) => {
  if (node.type === 'img') {
    const blurDataURL = await generateBlurHash(node.url)
    node.blurDataURL = blurDataURL
  } else if (node.children) {
    for (const child of node.children) {
      await addBlurHash(child)
    }
  }
  return node
}
