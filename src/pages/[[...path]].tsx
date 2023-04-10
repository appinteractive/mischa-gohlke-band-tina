import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/tina/__generated__/client'
import React, { Suspense, useEffect, useState } from 'react'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import { Hero } from '@/components/Hero'
import { PrimaryFeatures } from '@/components/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/SecondaryFeatures'
import { addBlurHash } from '@/utils/blurhash'

import { ResponsiveImage } from '@/components/embeds/ResponsiveImage'
import VideoPlayer from '@/components/embeds/VideoPlayer'
import { isImage } from '@/lib/utils'

const Page = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <>
      <div className="absolute inset-0 -top-[40rem] -z-[1] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beams-home@95.jpg"
          alt=""
          className="-ml-[40rem] w-[163.125rem] max-w-none sm:-ml-[67.5rem]"
        />
      </div>
      <Head>
        <title>Grenzen sind relativ e.V.</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      <Header items={props.data?.nav?.main?.menu ?? []} />
      <main className="relative mx-auto grow px-6">
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
        {/* <div className="prose mx-auto ">
            <pre>{JSON.stringify(data.nav, null, 2)}</pre>
          </div> */}
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
          <div className="prose mx-auto max-w-3xl py-40">
            <h1>{data?.page?.title}</h1>
            <span className="prose-h1:hidden">
              <TinaMarkdown
                content={data?.page?.body}
                components={components}
              />
            </span>
          </div>
        )}
      </main>
      <Footer items={props.data?.nav?.footer?.footerMenu ?? []} />
    </>
  )
}

const components = {
  // disable h1 tags as we use the page title for SEO
  h1: () => <span className="hidden" />,
  // convert all div tags to spans
  div: (props) => {
    return <span {...props}>{props.children}</span>
  },
  // do not render figure inside p tags
  p: (props) => {
    if (isImage(props.url) === true) {
      // return children directly when url is an image
      // console.log('P ELEMENT IS AN IMAGE', props.url)
      return <TinaMarkdown {...props} content={props} components={components} />
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
  VideoPlayer: (props) => <VideoPlayer {...props} />,
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
  if (
    typeof window === 'undefined' &&
    res.props?.data?.page?.body?.children?.length
  ) {
    for (const node of res.props.data.page.body.children) {
      await addBlurHash(node)
    }
  }

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
