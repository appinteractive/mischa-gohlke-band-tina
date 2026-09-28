/** @jest-environment node */
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'
import handler from '@/pages/api/assets/[...params]'

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

  server = createServer((req, res) => {
    const url = new URL(req.url!, origin)
    const source = sources.get(url.pathname)
    if (source) {
      res.end(source)
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
    // JPEG chroma subsampling can tint the narrow white border slightly.
    for (const channel of pixel(0, 0)) expect(channel).toBeGreaterThan(240)
    expect(pixel(600, 315)[0]).toBeGreaterThan(240)
    expect(pixel(600, 315)[1]).toBeLessThan(10)
    if (name === 'oriented.jpg')
      expect(pixel(200, 315)).toEqual([255, 255, 255])
  }
)

it('flattens transparent pixels onto white instead of black', async () => {
  const response = await fetch(
    `${origin}/api/assets/social?src=%2Fmedia%2Ftransparent.png`
  )
  const stats = await sharp(Buffer.from(await response.arrayBuffer())).stats()
  expect(stats.channels.map((channel) => channel.min)).toEqual([255, 255, 255])
})

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
    `${origin}/api/assets/rs,s:1200x630,m:embed,b:FFFFFF/o:jpeg/q:85?image=%2Fmedia%2Fportrait.png`
  )
  expect(response.status).toBe(400)
})
