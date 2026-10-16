import { imageUrl, default as imageLoader } from '@/lib/image-loader'

describe('imageUrl', () => {
  it('builds the default downfit WebP URL and encodes the source', () => {
    expect(imageLoader({ src: '/media/image one.jpeg', width: 640 })).toBe(
      '/api/assets/transform?width=640&quality=75&src=%2Fmedia%2Fimage%20one.jpeg'
    )
  })

  it('supports a bounded height and custom quality', () => {
    expect(
      imageUrl({
        src: 'https://assets.tina.io/photo.jpg',
        width: 1920,
        height: 1080,
        quality: 85,
      })
    ).toBe(
      '/api/assets/transform?width=1920&height=1080&quality=85&src=https%3A%2F%2Fassets.tina.io%2Fphoto.jpg'
    )
  })

  it('leaves SVG sources untouched', () => {
    expect(imageUrl({ src: '/media/icon.svg?version=2', width: 640 })).toBe(
      '/media/icon.svg?version=2'
    )
  })

  it('routes Tina staging SVGs through the fallback-aware endpoint', () => {
    expect(
      imageUrl({
        src: 'https://assets.tina.io/client/__staging/feat%2Fimages/icon.svg',
        width: 640,
      })
    ).toBe(
      '/api/assets/transform?width=640&quality=75&src=https%3A%2F%2Fassets.tina.io%2Fclient%2F__staging%2Ffeat%252Fimages%2Ficon.svg'
    )
  })

  it.each([
    [{ src: '/media/image.jpg', width: 0 }, 'width'],
    [{ src: '/media/image.jpg', width: 3841 }, 'width'],
    [{ src: '/media/image.jpg', width: 640, height: 0 }, 'height'],
    [{ src: '/media/image.jpg', width: 640, quality: 101 }, 'quality'],
  ])('rejects invalid transform values', (options, field) => {
    expect(() => imageUrl(options)).toThrow(field)
  })
})
