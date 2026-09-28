/** @jest-environment node */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  DEFAULT_SOCIAL_IMAGE,
  socialImageOrigin,
  socialImageUrl,
} from '@/lib/social-image'

afterEach(() => jest.restoreAllMocks())

it('uses a checked-in fallback for absent or unsupported images', () => {
  expect(existsSync(join(process.cwd(), 'public', DEFAULT_SOCIAL_IMAGE))).toBe(
    true
  )
  for (const source of [undefined, '', 'https://example.com/photo.jpg']) {
    const url = new URL(socialImageUrl('https://site.example', source))
    expect(url.origin).toBe('https://site.example')
    expect(url.pathname).toBe('/api/assets/social')
    expect(url.searchParams.get('src')).toBe(DEFAULT_SOCIAL_IMAGE)
  }
})

it.each([
  '/media/Grüße & Frieden #1.jpg',
  'https://assets.tina.io/client/__staging/main/__file/photo%20one.png',
  '/media/logo.svg',
])('encodes the complete source exactly once: %s', (source) => {
  expect(
    new URL(socialImageUrl('https://site.example', source)).searchParams.get(
      'src'
    )
  ).toBe(source)
})

it('uses the preview deployment for previews and the stable site URL for production', () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    SITE_URL: 'https://site.example/some/path',
    VERCEL_URL: 'preview.example',
    VERCEL_ENV: 'preview',
  })
  expect(socialImageOrigin()).toBe('https://preview.example')
  process.env.VERCEL_ENV = 'production'
  expect(socialImageOrigin()).toBe('https://site.example')
  delete process.env.SITE_URL
  expect(socialImageOrigin()).toMatch(/^https:\/\/www\./)
})
