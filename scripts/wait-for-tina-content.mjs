import { globSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const query = `query BuildContentReadiness {
  pageConnection(first: -1) {
    edges { node { ... on Document { _sys { relativePath } } } }
  }
  navMainConnection(first: -1) {
    edges { node { ... on Document { _sys { relativePath } } } }
  }
  navFooterConnection(first: -1) {
    edges { node { ... on Document { _sys { relativePath } } } }
  }
}`

// Tina's indexing status can be complete before collection queries expose all
// documents after a schema upgrade. Wait before Next prerenders or builds its
// sitemap; accepting a partial list can silently omit real pages.
export async function waitForTinaContent({
  client,
  expected,
  timeoutMs = 10 * 60 * 1000,
  intervalMs = 5000,
  now = Date.now,
  sleep = delay,
  log = console.log,
}) {
  const deadline = now() + timeoutMs
  while (true) {
    const response = await client.request(
      { query, variables: {} },
      {
        fetchOptions: {
          signal: AbortSignal.timeout(
            Math.max(1, Math.min(30000, deadline - now()))
          ),
        },
      }
    )
    if (response.errors?.length || !response.data) {
      throw new Error('Tina content readiness query failed')
    }
    const missing = Object.entries(expected).flatMap(([collection, files]) => {
      const edges = response.data[`${collection}Connection`]?.edges
      if (!Array.isArray(edges)) {
        throw new Error(`Tina readiness query omitted ${collection}Connection`)
      }
      const indexed = new Set(
        edges.map((edge) => edge?.node?._sys?.relativePath)
      )
      return files
        .filter((file) => !indexed.has(file))
        .map((file) => `${collection}/${file}`)
    })
    if (missing.length === 0) {
      log('Tina content ready: all checked-in pages and navigation are indexed')
      return
    }
    if (now() >= deadline) {
      throw new Error(`Tina content index incomplete: ${missing.join(', ')}`)
    }
    log(`Waiting for Tina content index: ${missing.length} documents missing`)
    await sleep(Math.min(intervalMs, deadline - now()))
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const root = path.resolve(import.meta.dirname, '..')
  const { default: generatedClient } =
    await import('../tina/__generated__/client.ts')
  const { createClient } = await import('tinacms/dist/client')
  // A cached partial response would never become ready on later polls.
  const client = createClient({
    url: generatedClient.apiUrl,
    token: generatedClient.readonlyToken,
    queries: () => ({}),
    cache: false,
  })
  await waitForTinaContent({
    client,
    expected: {
      page: [
        ...globSync('**/*.mdx', { cwd: path.join(root, 'content/pages') }),
      ],
      navMain: ['main.json'],
      navFooter: ['footer.json'],
    },
  })
}
