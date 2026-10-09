/** @jest-environment node */
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '@/pages/api/assets/[...params]'

jest.mock('caravaggio', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn((_req, res) => res.status(200).end('image'))),
}))

function request(overrides = {}) {
  const req = {
    method: 'GET',
    query: {
      params: ['rs,s:640x,m:downfit', 'o:webp', 'q:75'],
      image: '/media/photo.jpg',
    },
    ...overrides,
  } as unknown as NextApiRequest
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    end: jest.fn(),
  }
  handler(req, res as unknown as NextApiResponse)
  return res
}

it('serves approved transforms', () => {
  expect(request().status).toHaveBeenCalledWith(200)
})

it('rejects unsupported HTTP methods', () => {
  const res = request({ method: 'POST' })
  expect(res.status).toHaveBeenCalledWith(405)
  expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET')
})

it('rejects unbounded operations', () => {
  const res = request({
    query: { params: ['rotate:90'], image: '/media/a.jpg' },
  })
  expect(res.status).toHaveBeenCalledWith(400)
})

it.each(['http://127.0.0.1/private', '//example.com/a.jpg', '/api/subscribe'])(
  'rejects proxying %s',
  (image) => {
    const res = request({
      query: { params: ['rs,s:640x,m:downfit', 'o:webp', 'q:75'], image },
    })
    expect(res.status).toHaveBeenCalledWith(403)
  }
)

describe('Tina staging image fallback', () => {
  const staging =
    'https://assets.tina.io/client/__staging/feat/images/__file/photo.jpg'
  const originalFetch = global.fetch
  const transform = jest
    .requireMock('caravaggio')
    .default.mock.calls[0][0].plugins.plugins[0].instance().urlTransform
  const req = { headers: { host: 'localhost:3105' } }

  beforeEach(() => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      VERCEL_URL: '',
      VERCEL_AUTOMATION_BYPASS_SECRET: '',
    })
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.fetch = originalFetch
  })

  // Tina answers HEAD with 404 for staged files it serves; missing media can
  // come back as an HTML page. Only image responses count as available.
  const image = {
    ok: true,
    headers: new Headers({ 'content-type': 'image/jpeg' }),
  }
  const html = {
    ok: true,
    headers: new Headers({ 'content-type': 'text/html' }),
  }
  const missing = {
    ok: false,
    headers: new Headers({ 'content-type': 'text/html' }),
  }

  it('probes staged Tina assets with a bounded one-byte GET', async () => {
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValue(image)
    expect(await transform(staging, req)).toBe(staging)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(staging, {
      method: 'GET',
      headers: { 'user-agent': '', range: 'bytes=0-0' },
      signal: expect.any(AbortSignal),
    })
  })

  it('uses checked-in media when the staging asset is missing', async () => {
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValueOnce(missing).mockResolvedValueOnce(image)
    expect(await transform(staging, req)).toBe(
      'http://localhost:3105/media/photo.jpg'
    )
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:3105/media/photo.jpg',
      {
        method: 'HEAD',
        headers: { 'user-agent': '' },
        signal: expect.any(AbortSignal),
      }
    )
  })

  it('does not accept an HTML page as checked-in media', async () => {
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockResolvedValueOnce(missing).mockResolvedValueOnce(html)
    expect(await transform(staging, req)).toBe(
      'https://assets.tina.io/client/photo.jpg'
    )
  })

  it('uses the canonical Tina asset when both probes fail', async () => {
    const fetchMock = global.fetch as jest.Mock
    fetchMock.mockRejectedValue(new Error('Timed out'))
    expect(await transform(staging, req)).toBe(
      'https://assets.tina.io/client/photo.jpg'
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('drops query strings Tina would reject', async () => {
    const fetchMock = global.fetch as jest.Mock
    expect(
      await transform('https://assets.tina.io/client/photo.jpg?v=2#x', req)
    ).toBe('https://assets.tina.io/client/photo.jpg')
    fetchMock.mockResolvedValue(image)
    expect(await transform(`${staging}?v=2`, req)).toBe(staging)
    expect(fetchMock).toHaveBeenCalledWith(staging, expect.anything())
  })
})

it('translates neutral public URLs internally and restores the request', async () => {
  const processor = jest.requireMock('caravaggio').default.mock.results[0].value
  const originalUrl =
    '/api/assets/transform?width=320&height=180&quality=85&src=%2Fmedia%2Fphoto.jpg'
  const originalQuery = {
    params: ['transform'],
    width: '320',
    height: '180',
    quality: '85',
    src: '/media/photo.jpg',
  }
  const req = {
    method: 'GET',
    url: originalUrl,
    query: originalQuery,
  } as unknown as NextApiRequest
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    end: jest.fn(),
  }
  processor.mockImplementationOnce((request, response) => {
    expect(request.url).toBe(
      '/api/assets/rs,s:320x180,m:downfit/o:webp/q:85?image=%2Fmedia%2Fphoto.jpg'
    )
    expect(request.query).toEqual({ image: '/media/photo.jpg' })
    return response.status(200).end('image')
  })
  await handler(req, res as unknown as NextApiResponse)
  expect(req.url).toBe(originalUrl)
  expect(req.query).toBe(originalQuery)
})

it.each([undefined, ['320', '640'], '0', '3841', '10/rotate:90'])(
  'rejects an invalid public width %s',
  (width) => {
    expect(
      request({
        query: { params: ['transform'], width, src: '/media/photo.jpg' },
      }).status
    ).toHaveBeenCalledWith(400)
  }
)

it('rejects an external source on the neutral route', () => {
  expect(
    request({
      query: {
        params: ['transform'],
        width: '320',
        src: 'https://example.com/a.jpg',
      },
    }).status
  ).toHaveBeenCalledWith(403)
})
