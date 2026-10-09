/** @jest-environment node */
import client from '@/tina/__generated__/client'
import { getStaticPaths, getStaticProps } from '@/pages/[[...path]]'

// The page's UI imports Tina's ESM bundles; data functions don't use them.
jest.mock('tinacms/dist/react', () => ({ useTina: jest.fn() }))
jest.mock('tinacms/dist/rich-text', () => ({ TinaMarkdown: jest.fn() }))
jest.mock(
  '@/tina/__generated__/client',
  () => ({
    __esModule: true,
    default: {
      request: jest.fn(),
      queries: { page: jest.fn(), nav: jest.fn() },
    },
  }),
  { virtual: true }
)

const tina = client as unknown as {
  request: jest.Mock
  queries: { page: jest.Mock; nav: jest.Mock }
}

beforeEach(() => {
  jest.clearAllMocks()
  tina.queries.nav.mockResolvedValue({
    data: {
      navFooterConnection: {
        edges: [{ node: { _values: { footerMenu: [] } } }],
      },
      navMainConnection: { edges: [{ node: { _values: { menu: [] } } }] },
    },
  })
})

it('renders pages created after the build on their first request', async () => {
  tina.request.mockResolvedValue({
    data: {
      collection: {
        documents: {
          edges: [{ node: { _sys: { breadcrumbs: ['kontakt'] } } }],
        },
      },
    },
  })
  const result = await getStaticPaths()
  expect(result.paths).toEqual([{ params: { path: ['kontakt'] } }])
  expect(result.fallback).toBe('blocking')
})

it('answers a path without a Tina page with a 404 that is checked again', async () => {
  tina.queries.page.mockRejectedValue(new Error('Unable to find record'))
  await expect(
    getStaticProps({ params: { path: ['does-not-exist'] } })
  ).resolves.toEqual({ notFound: true, revalidate: 60 })
  expect(tina.queries.page).toHaveBeenCalledWith({
    relativePath: 'does-not-exist.mdx',
  })
})

it('renders a page that Tina knows, even if it was not prerendered', async () => {
  tina.queries.page.mockResolvedValue({
    query: 'query',
    data: {
      page: {
        __typename: 'PageSimple',
        title: 'Neue Seite',
        body: { type: 'root', children: [] },
      },
    },
  })
  const result = await getStaticProps({ params: { path: ['neue-seite'] } })
  expect(result).not.toHaveProperty('notFound')
  expect(result).toMatchObject({
    props: {
      variables: { relativePath: 'neue-seite.mdx' },
      data: { page: { title: 'Neue Seite' } },
    },
  })
})
