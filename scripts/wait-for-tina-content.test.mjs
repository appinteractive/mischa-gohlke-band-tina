import assert from 'node:assert/strict'
import { test } from 'node:test'
import { waitForTinaContent } from './wait-for-tina-content.mjs'

const expected = {
  page: ['index.mdx', 'nested/page.mdx'],
  navMain: ['main.json'],
  navFooter: ['footer.json'],
}

function response(files = expected) {
  return {
    data: Object.fromEntries(
      Object.entries(files).map(([name, paths]) => [
        `${name}Connection`,
        {
          edges: paths.map((relativePath) => ({
            node: { _sys: { relativePath } },
          })),
        },
      ])
    ),
  }
}

test('waits for pages AND footer after Tina reports indexing complete', async () => {
  const snapshots = [
    response({ ...expected, page: [], navFooter: [] }),
    response({ ...expected, navFooter: [] }),
    response(),
  ]
  let requests = 0
  const sleeps = []
  await waitForTinaContent({
    client: { request: async () => snapshots[requests++] },
    expected,
    sleep: async (ms) => sleeps.push(ms),
    log: () => {},
  })
  assert.equal(requests, 3)
  assert.equal(sleeps.length, 2)
})

test('fails with missing paths instead of prerendering a partial site', async () => {
  let time = 0
  await assert.rejects(
    waitForTinaContent({
      client: {
        request: async () => response({ ...expected, page: ['index.mdx'] }),
      },
      expected,
      now: () => time,
      sleep: async (ms) => {
        time += ms
      },
      intervalMs: 5,
      timeoutMs: 10,
      log: () => {},
    }),
    /Tina content index incomplete: page\/nested\/page.mdx/
  )
})

test('returns immediately for a complete index, including additional cloud pages', async () => {
  await waitForTinaContent({
    client: {
      request: async () =>
        response({ ...expected, page: [...expected.page, 'new.mdx'] }),
    },
    expected,
    sleep: async () => assert.fail('complete content should not wait'),
    log: () => {},
  })
})

test('does not treat GraphQL errors or missing connections as readiness', async () => {
  for (const result of [
    { errors: [{ message: 'unavailable' }] },
    { data: {} },
  ]) {
    await assert.rejects(
      waitForTinaContent({
        client: { request: async () => result },
        expected,
      }),
      /Tina .*query/
    )
  }
})
