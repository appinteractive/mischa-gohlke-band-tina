/** @jest-environment node */
import {
  aliasRedirects,
  parseAlias,
  validateAliases,
} from '@/lib/redirect-aliases.mjs'

// Next exits the process for an invalid redirect; report it as an exception.
function nextAccepts(redirects: object[]) {
  const { checkCustomRoutes } = jest.requireActual(
    'next/dist/lib/load-custom-routes'
  )
  const exit = jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('Invalid redirect found')
  })
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    checkCustomRoutes(redirects, 'redirect')
  } finally {
    exit.mockRestore()
    error.mockRestore()
  }
}

describe('parseAlias', () => {
  it.each([
    // Full URLs editors pasted; these failed production builds in 2023.
    [
      'https://www.mischagohlkeband.de/grenzen-sind-relativ-kulturfestival-2023',
      '/grenzen-sind-relativ-kulturfestival-2023',
    ],
    ['http://mischagohlkeband.de/alt/', '/alt'],
    ['www.mischagohlkeband.de/alt', '/alt'],
    // Copy-paste leftovers: trailing spaces, non-breaking spaces, zero-width.
    [
      '/live/connect-with-music-170425-lokschuppen-bielefeld  ',
      '/live/connect-with-music-170425-lokschuppen-bielefeld',
    ],
    ['\u00a0/alt\u200b\ufeff', '/alt'],
    ['//aktivitaeten//alt', '/aktivitaeten/alt'],
    ['alt-ohne-slash', '/alt-ohne-slash'],
    ['/alt?ref=newsletter#anker', '/alt'],
  ])('turns %j into %j', (value, path) => {
    expect(parseAlias(value)).toEqual({ path })
  })

  it.each([
    'https://example.com/fremd',
    '//example.com/fremd',
    'mailto:info@mischagohlkeband.de',
    '/zwei worte',
    '   ',
  ])('rejects %j', (value) => {
    expect(parseAlias(value)).toHaveProperty('error')
  })
})

describe('aliasRedirects', () => {
  it('builds redirects Next accepts from messy editor input', () => {
    const warn = jest.fn()
    const redirects = aliasRedirects(
      [
        {
          path: '/festival-2023',
          alias: [
            'https://www.mischagohlkeband.de/kulturfestival-2023',
            '/kulturfestival-2023 ',
            '/festival-2023',
            'https://example.com/fremd',
            '/event/:id',
            '/a(b)+c*{d}',
          ],
        },
        { path: '/', alias: null },
      ],
      warn
    )
    expect(redirects).toEqual([
      {
        source: '/kulturfestival-2023',
        destination: '/festival-2023',
        permanent: true,
      },
      {
        source: '/event/\\:id',
        destination: '/festival-2023',
        permanent: true,
      },
      {
        source: '/a\\(b\\)\\+c\\*\\{d\\}',
        destination: '/festival-2023',
        permanent: true,
      },
    ])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(() => nextAccepts(redirects)).not.toThrow()
  })

  it('keeps an alias that deliberately replaces another page, with a warning', () => {
    const warn = jest.fn()
    expect(
      aliasRedirects(
        [
          { path: '/neu', alias: ['/alt'] },
          { path: '/alt', alias: [] },
        ],
        warn
      )
    ).toEqual([{ source: '/alt', destination: '/neu', permanent: true }])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('hides the page'))
  })

  it('shows why the unchecked aliases used to fail the build', () => {
    expect(() =>
      nextAccepts([
        {
          source: 'https://www.mischagohlkeband.de/kulturfestival-2023',
          destination: '/festival-2023',
          permanent: true,
        },
      ])
    ).toThrow('Invalid redirect found')
  })
})

describe('validateAliases', () => {
  it('names the first unusable alias for the editor', () => {
    expect(
      validateAliases(['/gut', 'https://example.com/fremd', '/auch gut'])
    ).toBe(
      'Nur Adressen dieser Website können umgeleitet werden. (https://example.com/fremd)'
    )
  })

  it('accepts pasted URLs of this site and empty rows', () => {
    expect(
      validateAliases([
        'https://www.mischagohlkeband.de/alt',
        '',
        undefined,
        '/neu ',
      ])
    ).toBeUndefined()
    expect(validateAliases(undefined)).toBeUndefined()
  })
})
