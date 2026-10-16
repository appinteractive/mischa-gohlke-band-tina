/** @jest-environment node */
import { croppedLoader, imageUrl } from '@/lib/image-loader'
import { isAllowedImageOperation } from '@/lib/image-cache'
import handler from '@/pages/api/assets/[...params]'
import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('caravaggio', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn((_req, res) => res.status(200).end('image'))),
}))

describe('bounded cover images', () => {
  it.each([
    [2, 320],
    [5 / 4, 512],
    [8 / 5, 400],
  ])(
    'crops width 640 at ratio %s without changing the requested width',
    (ratio, height) => {
      const url = new URL(
        croppedLoader(ratio)({ src: '/media/a.jpg', width: 640 }),
        'https://local.invalid'
      )
      expect(url.searchParams.get('width')).toBe('640')
      expect(url.searchParams.get('height')).toBe(String(height))
      expect(url.searchParams.get('fit')).toBe('cover')
    }
  )
  it.each([0, -1, NaN, Infinity])('rejects invalid ratio %s', (ratio) => {
    expect(() => croppedLoader(ratio)).toThrow(RangeError)
  })
  it('rejects out-of-bounds output instead of lying about the srcset width', () => {
    expect(() =>
      croppedLoader(1 / 2)({ src: '/media/a.jpg', width: 3840 })
    ).toThrow(RangeError)
    expect(() => croppedLoader(2)({ src: '/media/a.jpg', width: 0 })).toThrow(
      RangeError
    )
  })
  it.each([2, 5 / 4, 8 / 5])(
    'keeps every standard candidate within bounds at ratio %s',
    (ratio) => {
      for (const width of [
        16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920,
        2048, 3840,
      ]) {
        const url = new URL(
          croppedLoader(ratio)({ src: '/media/a.jpg', width }),
          'https://local.invalid'
        )
        expect(Number(url.searchParams.get('width'))).toBe(width)
        expect(Number(url.searchParams.get('height'))).toBeGreaterThan(0)
        expect(Number(url.searchParams.get('height'))).toBeLessThanOrEqual(3840)
      }
    }
  )
  it('requires height for an explicit cover request', () => {
    expect(() =>
      imageUrl({ src: '/media/a.jpg', width: 640, fit: 'cover' })
    ).toThrow()
  })
  it('keeps SVG passthrough and staging fallback routing', () => {
    expect(croppedLoader(2)({ src: '/media/a.svg', width: 640 })).toBe(
      '/media/a.svg'
    )
    expect(
      croppedLoader(2)({
        src: 'https://assets.tina.io/client/__staging/main/a.svg',
        width: 640,
      })
    ).toContain('/api/assets/transform?')
  })
  it('allows only bounded cover operations with both dimensions', () => {
    expect(isAllowedImageOperation('rs,s:640x320,m:fill/o:webp/q:75')).toBe(
      true
    )
    for (const operation of [
      'rs,s:640x,m:fill/o:webp/q:75',
      'rs,s:640x0,m:fill/o:webp/q:75',
      'rs,s:640x3841,m:fill/o:webp/q:75',
      'rs,s:640x320,m:stretch/o:webp/q:75',
    ])
      expect(isAllowedImageOperation(operation)).toBe(false)
  })
})

async function request(query = {}) {
  const req = {
    method: 'GET',
    query: {
      params: ['transform'],
      src: '/media/a.jpg',
      width: '640',
      height: '320',
      fit: 'cover',
      ...query,
    },
  } as unknown as NextApiRequest
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    end: jest.fn(),
  }
  await handler(req, res as unknown as NextApiResponse)
  return res
}

it('serves a guarded cover request', async () => {
  expect((await request()).status).toHaveBeenCalledWith(200)
})
it.each([
  { fit: 'stretch' },
  { fit: ['cover', 'cover'] },
  { height: undefined },
  { width: ['640', '800'] },
  { height: '3841' },
  { quality: '101' },
])('rejects invalid cover parameters %j', async (query) => {
  expect((await request(query)).status).toHaveBeenCalledWith(400)
})
it('retains source restrictions for cover requests', async () => {
  expect(
    (await request({ src: 'http://127.0.0.1/private' })).status
  ).toHaveBeenCalledWith(403)
})
