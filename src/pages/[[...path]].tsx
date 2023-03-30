// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/.tina/__generated__/client'
import React, { Suspense, useEffect, useState } from 'react'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import { Hero } from '@/components/Hero'
import { PrimaryFeatures } from '@/components/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/SecondaryFeatures'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Image from 'next/image'
import { BlurhashCanvas } from 'react-blurhash'
import { addBlurHash } from '@/utils/blurhash'

const Page = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/beams-home@95.jpg"
        alt=""
        className="absolute -top-[1rem] left-1/2 z-0 -ml-[40rem] w-[163.125rem] max-w-none sm:-ml-[67.5rem]"
      />
      <Head>
        <title>TaxPal - Accounting made simple for small businesses</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      <Header />
      <main className="relative">
        <div className="mx-auto">
          {data.page._sys.breadcrumbs.length > 1 && (
            <Breadcrumbs
              items={data.page._sys.breadcrumbs}
              className="mx-auto max-w-6xl"
            />
          )}
          {/* <h1 className="m-8 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              {data.post.title}
            </h1> */}
          {/* <ContentSection content={data.post.body}></ContentSection> */}
          {/* <div className="prose mx-auto ">
            <pre>{JSON.stringify(data.page, null, 2)}</pre>
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
              <h1>{data.page.title}</h1>
              <span className="prose-h1:hidden">
                <TinaMarkdown
                  content={data.page.body}
                  components={components}
                />
              </span>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

const ResponsiveImage = (props) => {
  const title = props.title?.trim()
  const alt = props.alt?.trim()
  const caption = props.caption?.trim() ?? title ?? alt

  const hasInfos = title || alt || caption

  return (
    <figure className="not-prose aspect-w-16 aspect-h-9 relative my-5 flex items-center justify-center overflow-hidden rounded-md">
      <BlurhashCanvas
        hash={props.blurDataURL}
        punch={1}
        width={768}
        height={432}
        className="absolute inset-0 top-0 left-0 !h-full !w-full"
      />
      <Image
        src={props.url}
        alt={props.alt}
        // set sizes to 100vw when the screen is smaller than 768px and 768px when it's larger
        sizes="(max-width: 768px) 100vw, (min-width: 768px) 768"
        fill
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik0wIDBoMTAwdjEwMEgwVjB6Ii8+PC9zdmc+"
        className="prose-no bg-transparent object-contain"
      />
      {/* {hasInfos && (
        <figcaption className="absolute bottom-0 flex w-full shrink grow-0 flex-col bg-black bg-opacity-50 p-3">
          <span className="font-semibold text-white">{alt}</span>
          {title && <span className="text-xs text-gray-200">{title}</span>}
        </figcaption>
      )} */}
    </figure>
  )
}

const isImage = (url: string): boolean => {
  return /\.(gif|jpe?g|png|webp|bmp)$/i.test(url) != null
}

const components = {
  // disable h1 tags as we use the page title for SEO
  h1: () => null,
  // convert all div tags to spans
  div: (props) => {
    return <span {...props}>{props.children}</span>
  },
  // do not render figure inside p tags
  p: (props) => {
    // if children contains a img tag
    const hasImage =
      props?.children?.props?.content?.find(
        (child) => child.type == 'a' && isImage(child.url)
      ) != null

    if (hasImage) {
      return <span {...props}>{props.children}</span>
    } else {
      return <p {...props}>{props.children}</p>
    }
  },
  // stop linking images to themselves
  a: (props) => {
    // is image check when url includes .jpg, jpeg, .png, .svg, .gif, .webp
    if (isImage(props.url)) {
      // return children directly when url is an image
      return <>{props.children}</>
    } else {
      return <a {...props}>{props.children}</a>
    }
  },
  img: (props) => {
    return (
      <span>
        <span>blurDataURL: {JSON.stringify(props)}</span>
        <ResponsiveImage {...props} />
      </span>
    )
  },
}

const queryByPath = async (path: string[] = ['index']): Promise<any> => {
  console.log('>>>>queryByPath', path)
  let page: any
  let query = {}
  let data = {}
  let breadcrumbs = [...path]
  let relativePath = breadcrumbs.join('/')

  let extensions = ['', '.md', '.mdx', '/index', '/index.md', '/index.mdx']

  console.log('queryByPath', extensions, breadcrumbs, relativePath)

  // query path.join('/') + [.md, .mdx] until a page is found
  // async loop through extensions until a page is found
  for (
    let i = 0;
    !page?.id && i < extensions.length && breadcrumbs.length > 0;
    i++
  ) {
    if (page != null) {
      console.log('continue')
      continue
    }

    relativePath = breadcrumbs.join('/') + extensions[i]

    try {
      const res = await client.queries.page({ relativePath })
      page = res?.data?.page
      query = res?.query
      data = res?.data
    } catch (err) {
      // console.error(err)
      // swallow errors related to document creation
    }
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
  const res = await queryByPath(params.path)

  if (
    typeof window === 'undefined' &&
    res.props?.data?.page?.body?.children?.length
  ) {
    for (const node of res.props.data.page.body.children) {
      await addBlurHash(node)
    }
  }

  return res
}

const preparePath = (relativePath: string): string[] => {
  // replace extensions and "index" from relativePath
  const path = relativePath.replace(/\.(md|mdx)$/, '').replace(/index$/, '')
  return path.split('/')
}

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pageConnection()

  const paths = pagesListData.data.pageConnection.edges.map((page) => ({
    params: {
      path: preparePath(page.node._sys.relativePath),
    },
  }))

  console.log(
    'paths',
    paths.map((p) => p.params.path.join('/'))
  )

  return {
    paths,
    fallback: 'blocking',
  }
}

export default Page
