// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/.tina/__generated__/client'
import React, { Suspense } from 'react'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import { Hero } from '@/components/Hero'
import { PrimaryFeatures } from '@/components/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/SecondaryFeatures'
import Breadcrumbs from '@/components/layout/Breadcrumbs'

const Page = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <>
      <Head>
        <title>TaxPal - Accounting made simple for small businesses</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      <Header />
      <main>
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
            <div className="prose mx-auto py-40">
              <h1>{data.page.title}</h1>
              <TinaMarkdown content={data.page.body} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
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

    /* console.log('queryByPath', {
      path,
      breadcrumbs,
      relativePath,
    }) */
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
  return await queryByPath(params.path)
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
