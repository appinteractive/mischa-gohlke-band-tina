import { SetStateAction, useEffect, useMemo, useState } from 'react'
import { TinaCMS } from 'tinacms'
import Fuse from 'fuse.js'

const cleanPath = (path: string = '') => {
  // replace ^content/pages/ and .mdx$
  if (path?.trim() === '') return ''
  try {
    return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
  } catch {
    return ''
  }
}

interface Response {
  collection: {
    documents: {
      edges: {
        node: {
          id: string
          _internalSys: {
            title: string | null
          }
        }
      }[]
    }
  }
}

type ReferenceOption = {
  id: string
  title: string
}

async function fetchReferenceOptions(
  cms: TinaCMS,
  collection: string
): Promise<ReferenceOption[]> {
  const response: Response = await cms.api.tina.request(
    `#graphql
  query ($collection: String!){
    collection(collection: $collection) {
      documents(first: -1) {
        edges {
          node {
            ...on Node {
              id,
            }
            ...on Document {
              _internalSys: _sys {
                title
              }
            }
          }
        }
      }
    }
  }
  `,
    { variables: { collection } }
  )

  return response.collection.documents.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node._internalSys.title,
  }))
}

export const useReference = (cms: TinaCMS, collection: string) => {
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState<ReferenceOption[]>([])
  const { cache, setCache } = useReferenceCache(collection)
  const isMounted = useIsMounted()

  useEffect(() => {
    if (cache.length) {
      setOptions(cache)
      setLoading(false)
      return
    }
    fetchReferenceOptions(cms, collection).then((options) => {
      if (!isMounted) return
      setOptions(options)
      setCache(options)
      setLoading(false)
    })
  }, [cache, cache.length, cms, collection, isMounted, setCache])

  useEffect(() => {
    if (!cache.length) return
    setLoading(false)
  }, [cache, setOptions])

  return {
    loading,
    options,
  }
}

export const useSelected = (options: ReferenceOption[], id: string) => {
  return options?.find((option) => option.id === id)
}

export const useFilteredOptions = (
  options: ReferenceOption[],
  search: string
) => {
  // setup fuse search
  const fuse = useMemo(
    () =>
      new Fuse(options, {
        threshold: 0.5,
        keys: [
          {
            name: 'title',
            weight: 2,
          },
          {
            name: 'id',
            weight: 0.5,
            getFn: (option) => cleanPath(option.id),
          },
        ],
      }),
    [options]
  )

  const filteredOptions = useMemo(
    () =>
      search.trim()
        ? fuse.search(search).map((result) => result.item)
        : options,
    [options, search, fuse]
  )

  return {
    filteredOptions,
    filteredStats: {
      total: options.length,
      filtered: filteredOptions.length,
      isReduced: filteredOptions.length < options.length,
    },
  }
}

export const useIsMounted = () => {
  const [mounted, setMounted] = useState(true)
  useEffect(() => {
    if (!mounted) return
    return () => {
      setMounted(false)
    }
  }, [mounted])

  return mounted
}

export const useReferenceCache = (collection: string) => {
  const [cache, setCache] = useState<ReferenceOption[]>([])

  useEffect(() => {
    const cached = localStorage.getItem(`reference-${collection}`)
    if (cached) {
      setCache(JSON.parse(cached))
    }
  }, [collection])

  return {
    cache,
    setCache: (cache: ReferenceOption[]) => {
      localStorage.setItem(`reference-${collection}`, JSON.stringify(cache))
      setCache(cache)
    },
  }
}
