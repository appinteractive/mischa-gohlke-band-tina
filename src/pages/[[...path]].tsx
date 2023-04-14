import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/tina/__generated__/client'
import React, { Suspense, useEffect, useState } from 'react'

import Layout from '@/layouts/default'

import { addBlurHash } from '@/utils/blurhash'

import { isImage } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { getSubNavigation } from '@/lib/breadcrumbs'
import { useRouter } from 'next/router'
import { normalizeNavigation } from '@/lib/nav-model'
import clsx from 'clsx'

const Hero = dynamic(() => import('@/components/Hero'))
const PrimaryFeatures = dynamic(() => import('@/components/PrimaryFeatures'))
const SecondaryFeatures = dynamic(
  () => import('@/components/SecondaryFeatures')
)
const VideoPlayer = dynamic(() => import('@/components/embeds/VideoPlayer'))
const ResponsiveImage = dynamic(
  () => import('@/components/embeds/ResponsiveImage'),
  { ssr: false }
)
const SubNav = dynamic(() => import('@/components/layout/SubNav'))

const Page = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const currentUrl = useRouter().asPath
  const navigation = normalizeNavigation({ ...props.data.nav })
  const subNavigation = getSubNavigation(navigation.main, currentUrl)

  // check if subNav has more than one item or if that item has children
  const hasSubNav =
    subNavigation?.items?.length > 1 || subNavigation?.items[0]?.children

  const cmsComponents = useCmsComponents({ hasSubNav })

  const subNav =
    subNavigation?.items?.length > 0 ? (
      <SubNav items={subNavigation.items} parent={subNavigation.parent} />
    ) : null

  return (
    <>
      <Head>
        <title>Grenzen sind relativ e.V.</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      <Layout navigation={navigation} subNav={hasSubNav ? subNav : null}>
        {/* {data?.page?._sys?.breadcrumbs?.length > 1 && (
          <Breadcrumbs
            items={data.page._sys.breadcrumbs}
            className="mx-auto max-w-6xl"
          />
        )} */}
        {/* <h1 className="m-8 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              {data.post.title}
            </h1> */}
        {/* <ContentSection content={data.post.body}></ContentSection> */}
        <div className={clsx('prose relative mx-auto')}>
          {/* <pre>{JSON.stringify(navigation.main, null, 2)}</pre> */}

          {/* <pre>
            {JSON.stringify(
              getSubNavigation(navigation.main, currentUrl),
              null,
              2
            )}
          </pre> */}
          {/* <pre>{JSON.stringify(subNavigation, null, 2)}</pre> */}

          {/* <pre>{currentUrl}</pre>
          <pre>
            {JSON.stringify(
              findNavigationItem(currentUrl, navigation.main as any),
              null,
              2
            )}
          </pre>
          <pre>{JSON.stringify(subNavigation, null, 2)}</pre> */}
          {/* <pre>
            {JSON.stringify(
              getParentAndChildren(navigation.main as any, currentUrl),
              null,
              2
            )}
          </pre> */}
          {/* <pre>{JSON.stringify(navigation, null, 2)}</pre> */}
        </div>
        {data.page?.blocks?.length > 0 ? (
          data.page.blocks.map(function (block, i) {
            switch (block.__typename) {
              case 'PageBlocksBlocksHero':
                return (
                  <React.Fragment key={i + block.__typename}>
                    <Hero headline={block.headline} text={block.text} />
                  </React.Fragment>
                )
              case 'PageBlocksBlocksContent':
                return (
                  <React.Fragment key={i + block.__typename}>
                    <PrimaryFeatures />
                  </React.Fragment>
                )
              case 'PageBlocksBlocksFeatures':
                return (
                  <React.Fragment key={i + block.__typename}>
                    <SecondaryFeatures />
                  </React.Fragment>
                )
              default:
                return null
            }
          })
        ) : (
          <div className="prose mx-auto max-w-3xl">
            {/* <h1>{data?.page?.title}</h1> */}
            <span>
              <TinaMarkdown
                content={data?.page?.body}
                components={cmsComponents}
              />
            </span>
          </div>
        )}
      </Layout>
    </>
  )
}

function useCmsComponents({ hasSubNav }) {
  return {
    // disable h1 tags as we use the page title for SEO
    // h1: () => <span className="hidden" />,
    // convert all div tags to spans
    div: (props) => {
      return <span {...props}>{props.children}</span>
    },
    // do not render figure inside p tags
    p: (props) => {
      if (isImage(props.url) === true) {
        // return children directly when url is an image
        // console.log('P ELEMENT IS AN IMAGE', props.url)
        return (
          <TinaMarkdown {...props} content={props} components={components} />
        )
      }
      // if children contains a img tag
      const hasImage =
        props?.children?.props?.content?.find((child) => isImage(child.url)) !=
        null

      // console.log('hasImage', hasImage)

      if (hasImage) {
        return <span {...props}>{props.children}</span>
      } else {
        return <p {...props}>{props.children}</p>
      }
    },
    VideoPlayer: (props) => <VideoPlayer hasSubNav={hasSubNav} {...props} />,
    // stop linking images to themselves
    /* a: (props) => {
      // is image check when url includes .jpg, jpeg, .png, .svg, .gif, .webp
      if (isImage(props.url) === true) {
        // return children directly when url is an image
        return <>{props.children}</>
      } else {
        return (
          <a {...props}>
            {props.children}
          </a>
        )
      }
    }, */
    img: (props) => {
      return <ResponsiveImage {...props} />
    },
  }
}

const queryByPath = async (relativePath: string): Promise<any> => {
  let page: any
  let query = {}
  let data = {}

  try {
    const res = await client.queries.page({ relativePath })
    page = res?.data?.page
    query = res?.query
    data = res?.data
  } catch (err) {
    // console.error(err)
    // swallow errors related to document creation
  }

  return {
    props: {
      variables: { relativePath },
      data: data,
      query: query,
    },
  }
}

export const getStaticProps = async ({ params }) => {
  const path = params?.path ?? ['index']

  const [res, resNav] = await Promise.all([
    queryByPath(path.join('/') + '.mdx'),
    client.queries.nav(),
  ])

  // TODO: find a way to generate blur hashes on build or on upload
  /* if (
    typeof window === 'undefined' &&
    res.props?.data?.page?.body?.children?.length
  ) {
    for (const node of res.props.data.page.body.children) {
      await addBlurHash(node)
    }
  } */

  // add res.nav.data to res.props.data
  res.props.data['nav'] = {
    footer: resNav?.data.navFooterConnection.edges[0]?.node._values,
    main: resNav?.data.navMainConnection.edges[0]?.node._values,
  }

  return res
}

export const getStaticPaths = async () => {
  const response = await client.request({
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
              }
            }
          }
        }
      }
    `,
    variables: { collection: 'page' },
  })

  const paths = response.data.collection.documents.edges.map((page) => ({
    params: {
      path: page.node._sys.breadcrumbs?.filter((x) => x !== 'index') ?? [],
    },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default Page
