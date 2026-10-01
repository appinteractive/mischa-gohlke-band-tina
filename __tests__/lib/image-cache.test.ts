import {
  getTinaStagingFallback,
  getTinaStagingLocalSource,
  isAllowedImageOperation,
  isAllowedImageSource,
} from '@/lib/image-cache'

describe('getTinaStagingFallback', () => {
  it('handles unescaped slashes in Tina 3 branch names', () => {
    const source =
      'https://assets.tina.io/client/__staging/feat/images/__file/folder/photo.jpg'
    expect(getTinaStagingFallback(source)).toBe(
      'https://assets.tina.io/client/folder/photo.jpg'
    )
    expect(getTinaStagingLocalSource(source)).toBe('/media/folder/photo.jpg')
  })
  it('maps a missing branch asset to its canonical Tina URL', () => {
    expect(
      getTinaStagingFallback(
        'https://assets.tina.io/client/__staging/feat%2Fimages/photo.jpg'
      )
    ).toBe('https://assets.tina.io/client/photo.jpg')
  })

  it('removes the Tina 3.11 file marker from the canonical fallback', () => {
    expect(
      getTinaStagingFallback(
        'https://assets.tina.io/client/__staging/feat%2Fimages/__file/photo.jpg'
      )
    ).toBe('https://assets.tina.io/client/photo.jpg')
  })

  it.each([
    '/media/photo.jpg',
    'https://assets.tina.io/client/photo.jpg',
    'https://assets.tina.io.attacker.example/client/__staging/main/photo.jpg',
  ])('does not rewrite a non-staging Tina source', (source) => {
    expect(getTinaStagingFallback(source)).toBeUndefined()
  })
})

describe('getTinaStagingLocalSource', () => {
  it('maps a Tina staging asset to its checked-in media path', () => {
    expect(
      getTinaStagingLocalSource(
        'https://assets.tina.io/client/__staging/feat%2Fimages/folder/photo%20one.jpg'
      )
    ).toBe('/media/folder/photo%20one.jpg')
  })

  it('maps a Tina 3.11 staging file to its checked-in media path', () => {
    expect(
      getTinaStagingLocalSource(
        'https://assets.tina.io/client/__staging/feat%2Fimages/__file/folder/photo%20one.jpg'
      )
    ).toBe('/media/folder/photo%20one.jpg')
  })

  it('preserves reserved filename characters in the local URL', () => {
    expect(
      getTinaStagingLocalSource(
        'https://assets.tina.io/client/__staging/main/__file/photo%23one%3F.jpg'
      )
    ).toBe('/media/photo%23one%3F.jpg')
  })

  it.each([
    'https://assets.tina.io/client/photo.jpg',
    'https://assets.tina.io/client/__staging/main/%2e%2e/secret.jpg',
    'https://assets.tina.io/client/__staging/main/__file/%2e%2e/secret.jpg',
    'https://example.com/client/__staging/main/photo.jpg',
  ])('rejects an unsafe or non-staging source', (source) => {
    expect(getTinaStagingLocalSource(source)).toBeUndefined()
  })
})

describe('isAllowedImageOperation', () => {
  it.each([
    [['rs,s:640x,m:downfit', 'o:webp', 'q:75']],
    [['rs,s:1920x1080,m:downfit', 'o:webp', 'q:85']],
  ])('accepts generated Caravaggio operations', (params) => {
    expect(isAllowedImageOperation(params)).toBe(true)
  })

  it.each([
    undefined,
    ['rotate:90'],
    ['rs,s:0x,m:downfit', 'o:webp', 'q:75'],
    ['rs,s:3841x,m:downfit', 'o:webp', 'q:75'],
    ['rs,s:640x,m:downfit', 'o:auto', 'q:75'],
    ['rs,s:640x,m:downfit', 'o:webp', 'q:101'],
  ])('rejects unsupported or unbounded operations', (params) => {
    expect(isAllowedImageOperation(params)).toBe(false)
  })
})

describe('isAllowedImageSource', () => {
  it.each([
    '/media/photo.jpeg',
    '/media/folder/photo%20one.jpeg?version=2',
    '/_next/static/media/background.abc123.jpg',
    'https://assets.tina.io/photo.jpg',
  ])('accepts an approved image source', (source) => {
    expect(isAllowedImageSource(source)).toBe(true)
  })

  it.each([
    undefined,
    '',
    '/api/example',
    '/media/../api/example',
    '//assets.tina.io/photo.jpg',
    '//local.invalid/media/photo.jpg',
    String.raw`/\local.invalid/media/photo.jpg`,
    '/\t/local.invalid/media/photo.jpg',
    String.raw`/\example.com/media/photo.jpg`,
    '/\t/example.com/media/photo.jpg',
    '/\n/example.com/media/photo.jpg',
    'http://assets.tina.io/photo.jpg',
    'https://assets.tina.io.attacker.example/photo.jpg',
    'https://user:password@assets.tina.io/photo.jpg',
    'https://example.com/photo.jpg',
  ])('rejects an unapproved image source', (source) => {
    expect(isAllowedImageSource(source)).toBe(false)
  })
})
