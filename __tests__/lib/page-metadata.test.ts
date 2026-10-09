/** @jest-environment node */
import { canonicalUrl, siteOrigin } from '@/lib/site-url.mjs'
import { pageMetadata, pageRobots } from '@/lib/page-metadata'

afterEach(() => jest.restoreAllMocks())

it('keeps finished and legacy pages indexable, but excludes placeholders', () => {
  expect(pageRobots()).toBe('index, follow')
  expect(pageRobots(null)).toBe('index, follow')
  expect(pageRobots(false)).toBe('index, follow')
  expect(pageRobots(true)).toBe('noindex, follow')
})

it.each([undefined, null, false, true])(
  'preview indexing restrictions take precedence over the placeholder flag: %s',
  (isPlaceholder) => {
    expect(pageRobots(isPlaceholder, true)).toBe('noindex, nofollow')
  }
)

it('uses one trimmed description and a usable title for blank CMS values', () => {
  expect(pageMetadata(' Kontakt ', ' Kontakt zum Verein. ')).toEqual({
    title: 'Kontakt | Mischa Gohlke Band',
    description: 'Kontakt zum Verein.',
  })
  expect(pageMetadata(undefined, '  ')).toEqual(pageMetadata(null, undefined))
  expect(pageMetadata('Mischa Gohlke Band').title).toBe('Mischa Gohlke Band')
})

it.each(['/', '/index', '/index?utm_source=newsletter', '/#videos'])(
  'prefers the root homepage regardless of tracking or fragment: %s',
  (route) => {
    expect(canonicalUrl('https://www.mischagohlkeband.de', route)).toBe(
      'https://www.mischagohlkeband.de/'
    )
  }
)

it('canonical origin remains public in previews and paths exclude query parameters', () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    SITE_URL: 'https://www.mischagohlkeband.de/path',
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'preview.example',
  })
  expect(canonicalUrl(siteOrigin(), '/live/forum/?source=mail#date')).toBe(
    'https://www.mischagohlkeband.de/live/forum'
  )
})

it.each(['//evil.example/page', 'https://evil.example', '/\\evil.example'])(
  'rejects non-relative canonical routes: %s',
  (route) => {
    expect(() =>
      canonicalUrl('https://www.mischagohlkeband.de', route)
    ).toThrow()
  }
)
