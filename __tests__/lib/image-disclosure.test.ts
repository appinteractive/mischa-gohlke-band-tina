/** @jest-environment node */
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { NextApiRequest } from 'next'
import sharp from 'sharp'
import caravaggio from 'caravaggio'

let server: Server
let origin: string
let source: Buffer
let sourceAgent: string | undefined

beforeAll(async () => {
  source = await sharp({
    create: { width: 80, height: 40, channels: 3, background: 'red' },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .withExifMerge({
      IFD0: { Software: 'Private editor marker', Artist: 'Private author' },
    })
    .toBuffer()
  const processor = caravaggio({
    basePath: '/api/assets',
    logger: { options: { level: 'silent' } },
  })
  server = createServer((req, res) => {
    if (req.url === '/source.jpg') {
      sourceAgent = req.headers['user-agent']
      res.setHeader('Content-Type', 'image/jpeg')
      res.end(source)
      return
    }
    if (req.url === '/invalid.jpg') {
      res.statusCode = 404
      res.end('Not an image')
      return
    }
    const request = req as NextApiRequest
    request.query = Object.fromEntries(new URL(req.url!, origin).searchParams)
    void processor(request, res)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
})

it('strips embedded metadata, preserves orientation and sends no library user-agent', async () => {
  const original = await sharp(source).metadata()
  expect(original.exif).toBeDefined()
  const response = await fetch(
    `${origin}/api/assets/rs,s:64x64,m:downfit/o:webp/q:75?image=${encodeURIComponent(
      `${origin}/source.jpg`
    )}`
  )
  expect(response.status).toBe(200)
  const output = await sharp(
    Buffer.from(await response.arrayBuffer())
  ).metadata()
  expect(output.format).toBe('webp')
  expect(output.width).toBeLessThan(output.height!)
  for (const key of ['exif', 'xmp', 'iptc', 'icc', 'orientation']) {
    expect(output[key]).toBeUndefined()
  }
  expect(sourceAgent || '').toBe('')
  expect(JSON.stringify(Object.fromEntries(response.headers))).not.toMatch(
    /caravaggio|sharp|libvips|node-fetch/i
  )
})

it('returns a generic, non-cacheable error without vendor links, source URLs or stack traces', async () => {
  const response = await fetch(
    `${origin}/api/assets/rs,s:64x,m:downfit/o:webp/q:75?image=${encodeURIComponent(
      `${origin}/invalid.jpg`
    )}`
  )
  expect(response.status).toBe(500)
  expect(response.headers.get('content-type')).toMatch(/application\/json/)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  expect(await response.json()).toEqual({ error: 'Image unavailable' })
})
