import client from '@/tina/__generated__/client'

import Layout from '@/layouts/default'
import { normalizeNavigation } from '@/lib/nav-model'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

const Error = (props) => {
  const router = useRouter()
  const currentUrl = router.asPath
  const navigation = normalizeNavigation({ ...props.data.nav })

  useMemo(() => {
    // get all the pages from the cms
    try {
      client
        .request({
          query: `#graphql
          query ($collection: String!) {
            collection(collection: $collection) {
              documents(first: -1) {
                edges {
                  node {
                    ...on Document {
                      _sys {
                        breadcrumbs,
                      }
                    }
                    ...on PageSimple {
                      alias
                    }
                  }
                }
              }
            }
          }
        `,
          variables: { collection: 'page' },
        })
        .then((response) => {
          try {
            // search for the current page in response.data.collection.documents.edges[].node.alias[]
            const page = response.data.collection.documents.edges.find(
              (edge) => {
                const alias = edge.node.alias
                return alias?.length && alias.includes(currentUrl)
              }
            )
            if (page) {
              // if the page exists, redirect to the page
              router.push(page.node._sys.breadcrumbs.join('/'))
            }
          } catch (e) {}
        })
    } catch (e) {}
  }, [router, currentUrl])

  return (
    <>
      <Layout navigation={navigation}>
        <div className="prose mx-auto max-w-3xl prose-a:no-underline">
          <div className="grid min-h-full place-items-center px-6 py-16 sm:py-24 lg:px-8">
            <div className="text-center">
              <p className="text-base font-semibold text-indigo-500">
                Ups… 404
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Seite nicht gefunden
              </h1>
              <p className="-mt-6 text-base leading-7 text-gray-600">
                Diese Seite existiert leider nicht (mehr).
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/"
                  className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span aria-hidden="true">&larr;</span> zur Startseite
                </Link>
                <a
                  href={`mailto:mail@grenzensindrelativ.de?subject=404 – "${currentUrl}" existiert nicht`}
                  className="text-sm font-semibold text-gray-900"
                >
                  Sag uns Bescheid <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export const getStaticProps = async (context) => {
  const resNav = await client.queries.nav()

  const res = {
    props: {
      data: {},
    },
  }
  // add res.nav.data to res.props.data
  res.props.data['nav'] = {
    footer: resNav?.data.navFooterConnection.edges[0]?.node._values,
    main: resNav?.data.navMainConnection.edges[0]?.node._values,
  }

  return res
}

export default Error
