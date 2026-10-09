/** @jest-environment node */
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  createSitemapTransform,
  robotsPolicies,
} from '@/lib/sitemap-indexing.mjs'

let directory: string

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mgb-sitemap-'))
})

afterEach(() => rmSync(directory, { recursive: true, force: true }))

function writePage(filename: string, page: object) {
  const target = join(directory, filename)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify({ pageProps: { data: { page } } }))
}

it('excludes a prerendered placeholder and restores it when the flag is cleared', async () => {
  const transform = createSitemapTransform(directory, [])
  writePage('media/radio.json', { isPlaceholder: true })
  expect(await transform({}, '/media/radio')).toBeNull()

  writePage('media/radio.json', { isPlaceholder: false })
  expect(await transform({}, '/media/radio')).toEqual({
    loc: '/media/radio',
    trailingSlash: false,
  })
})

it('includes legacy pages with no flag, including the canonical homepage', async () => {
  const transform = createSitemapTransform(directory, [])
  writePage('index.json', { title: 'Home' })
  writePage('kontakt.json', { title: 'Kontakt' })
  expect(await transform({}, '/')).toEqual({ loc: '/', trailingSlash: true })
  expect(await transform({}, '/kontakt')).toEqual({
    loc: '/kontakt',
    trailingSlash: false,
  })
})

it('excludes redirect sources before reading their page data', async () => {
  const transform = createSitemapTransform(directory, [/^\/index$/])
  expect(await transform({}, '/index')).toBeNull()
})

it('fails visibly for missing build snapshots instead of silently indexing drafts', async () => {
  const transform = createSitemapTransform(directory, [])
  await expect(transform({}, '/not-built')).rejects.toThrow('ENOENT')
})

it.each([null, [], {}, { pageProps: { data: { page: null } } }])(
  'rejects malformed snapshots instead of silently including a route: %j',
  async (snapshot) => {
    writeFileSync(join(directory, 'broken.json'), JSON.stringify(snapshot))
    const transform = createSitemapTransform(directory, [])
    await expect(transform({}, '/broken')).rejects.toThrow(/snapshot/)
  }
)

describe('robots policy', () => {
  // Google applies the longest matching rule; Allow wins a tie.
  function crawlable(rules: Array<[string, string]>, path: string) {
    const match = rules
      .filter(([, prefix]) => path.startsWith(prefix))
      .sort(
        ([typeA, a], [typeB, b]) =>
          b.length - a.length || (typeA === 'allow' ? -1 : 1)
      )[0]
    return !match || match[0] === 'allow'
  }

  const imagePaths = [
    '/api/assets/transform?width=640&src=%2Fmedia%2Fteam.jpg',
    '/api/assets/social?v=2&src=%2Fmedia%2Fteaser.jpg',
  ]
  const blockedPaths = ['/api/confirm?email=a', '/admin/index.html']

  it.each([
    [
      'config',
      robotsPolicies.flatMap(({ allow, disallow }) => [
        ...[allow].flat().map((p): [string, string] => ['allow', p]),
        ...[disallow].flat().map((p): [string, string] => ['disallow', p]),
      ]),
    ],
    [
      'public/robots.txt',
      readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8')
        .split('\n')
        .map((line) => line.match(/^(Allow|Disallow):\s*(\S+)/))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map((match): [string, string] => [match[1].toLowerCase(), match[2]]),
    ],
  ])('%s keeps page and share images crawlable', (_source, rules) => {
    for (const path of imagePaths) expect(crawlable(rules, path)).toBe(true)
    for (const path of blockedPaths) expect(crawlable(rules, path)).toBe(false)
    expect(crawlable(rules, '/kontakt')).toBe(true)
  })
})
