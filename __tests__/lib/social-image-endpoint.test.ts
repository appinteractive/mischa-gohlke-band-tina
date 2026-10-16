/** @jest-environment node */
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'
import handler from '@/pages/api/assets/[...params]'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-image'

let server: Server
let origin: string
const sources = new Map<string, Buffer>()

beforeAll(async () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    VERCEL_URL: '',
    VERCEL_AUTOMATION_BYPASS_SECRET: '',
  })
  for (const [name, width, height] of [
    ['portrait', 400, 800],
    ['panorama', 1600, 400],
    ['small', 80, 40],
  ] as const) {
    sources.set(
      `/media/${name}.png`,
      await sharp({
        create: { width, height, channels: 3, background: 'red' },
      })
        .png()
        .withMetadata()
        .toBuffer()
    )
  }
  sources.set(
    '/media/transparent.png',
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer()
  )
  sources.set(
    '/media/oriented.jpg',
    await sharp({
      create: { width: 800, height: 400, channels: 3, background: 'red' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer()
  )
  sources.set(
    '/media/logo.svg',
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="red"/></svg>'
    )
  )
  sources.set(DEFAULT_SOCIAL_IMAGE, sources.get('/media/panorama.png')!)
  const checkerboard = Buffer.alloc(400 * 800 * 3)
  for (let y = 0; y < 800; y++) {
    for (let x = 0; x < 400; x++) {
      const value = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? 255 : 0
      checkerboard.fill(value, (y * 400 + x) * 3, (y * 400 + x) * 3 + 3)
    }
  }
  sources.set(
    '/media/checkerboard.png',
    await sharp(checkerboard, {
      raw: { width: 400, height: 800, channels: 3 },
    })
      .png()
      .toBuffer()
  )

  server = createServer((req, res) => {
    const url = new URL(req.url!, origin)
    const source = sources.get(decodeURIComponent(url.pathname))
    if (source) {
      // Static hosting labels media by extension; the endpoint relies on it.
      const extension = url.pathname.split('.').pop()
      res.setHeader(
        'Content-Type',
        extension === 'svg'
          ? 'image/svg+xml'
          : extension === 'png'
            ? 'image/png'
            : 'image/jpeg'
      )
      res.end(source)
      return
    }
    if (url.pathname === '/media/html-page.jpg') {
      // Hosts can answer a missing file with an HTML page and status 200.
      res.setHeader('Content-Type', 'text/html')
      res.end('<!doctype html><title>Not found</title>')
      return
    }
    if (url.pathname.startsWith('/media/')) {
      res.statusCode = 404
      res.end()
      return
    }
    const request = req as NextApiRequest
    request.query = {
      ...Object.fromEntries(url.searchParams),
      params: url.pathname.slice('/api/assets/'.length).split('/'),
    }
    const response = res as NextApiResponse
    response.status = (code) => {
      res.statusCode = code
      return response
    }
    response.json = (body) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }
    void handler(request, response)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
  jest.restoreAllMocks()
})

it.each([
  'portrait.png',
  'panorama.png',
  'small.png',
  'oriented.jpg',
  'logo.svg',
])(
  'returns an exact JPEG canvas without cropping or embedded metadata for %s',
  async (name) => {
    // Caller-supplied dimensions/format cannot override the fixed preset.
    const response = await fetch(
      `${origin}/api/assets/social?width=99999&format=png&src=${encodeURIComponent(
        `/media/${name}`
      )}`
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/image\/jpeg/)
    const buffer = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(buffer).metadata()
    expect(metadata).toMatchObject({ width: 1200, height: 630, format: 'jpeg' })
    for (const key of ['exif', 'xmp', 'iptc', 'icc', 'orientation'])
      expect(metadata[key]).toBeUndefined()
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true })
    const pixel = (x: number, y: number) =>
      Array.from(
        data.subarray(
          (y * info.width + x) * info.channels,
          (y * info.width + x) * info.channels + 3
        )
      )
    // The same red source fills the backdrop, without white side/top padding.
    expect(pixel(0, 0)[0]).toBeGreaterThan(240)
    expect(pixel(0, 0)[1]).toBeLessThan(60)
    expect(pixel(600, 315)[0]).toBeGreaterThan(240)
    expect(pixel(600, 315)[1]).toBeLessThan(10)
  }
)

it('blurs the covering background while keeping the complete foreground sharp', async () => {
  const response = await fetch(
    `${origin}/api/assets/social?src=%2Fmedia%2Fcheckerboard.png`
  )
  const output = Buffer.from(await response.arrayBuffer())
  const backgroundCrop = await sharp(output)
    .extract({ left: 10, top: 50, width: 300, height: 500 })
    .toBuffer()
  const foregroundCrop = await sharp(output)
    .extract({ left: 460, top: 50, width: 280, height: 500 })
    .toBuffer()
  const background = await sharp(backgroundCrop).stats()
  const foreground = await sharp(foregroundCrop).stats()
  expect(background.channels[0].mean).toBeGreaterThan(90)
  expect(background.channels[0].mean).toBeLessThan(170)
  expect(background.channels[0].stdev).toBeLessThan(15)
  expect(foreground.channels[0].stdev).toBeGreaterThan(80)
})

it('flattens transparent pixels onto white instead of black', async () => {
  const response = await fetch(
    `${origin}/api/assets/social?src=%2Fmedia%2Ftransparent.png`
  )
  const stats = await sharp(Buffer.from(await response.arrayBuffer())).stats()
  expect(stats.channels.map((channel) => channel.min)).toEqual([255, 255, 255])
})

it.each(['deleted.jpg', 'html-page.jpg'])(
  'uses the default teaser when older content references a missing local upload: %s',
  async (name) => {
    const missing = await fetch(
      `${origin}/api/assets/social?src=%2Fmedia%2F${name}`
    )
    const fallback = await fetch(
      `${origin}/api/assets/social?src=${encodeURIComponent(
        DEFAULT_SOCIAL_IMAGE
      )}`
    )
    expect(missing.status).toBe(200)
    // The local check can fail transiently; a CDN must not pin the substitute.
    expect(missing.headers.get('cache-control')).toBe('no-store')
    expect(Buffer.from(await missing.arrayBuffer())).toEqual(
      Buffer.from(await fallback.arrayBuffer())
    )
  }
)

it.each([
  'https://example.com/private',
  '//127.0.0.1/private',
  '/api/subscribe',
  '',
])('retains source restrictions for %s', async (source) => {
  const response = await fetch(
    `${origin}/api/assets/social?src=${encodeURIComponent(source)}`
  )
  expect(response.status).toBe(403)
})

it('does not expose the new processing operations as a general-purpose route', async () => {
  const response = await fetch(
    `${origin}/api/assets/rs,s:1200x630,m:social/o:jpeg/q:85?image=%2Fmedia%2Fportrait.png`
  )
  expect(response.status).toBe(400)
})
