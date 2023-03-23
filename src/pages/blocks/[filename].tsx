// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/.tina/__generated__/client'
import React from 'react'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import { Hero } from '@/components/Hero'
import { PrimaryFeatures } from '@/components/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/SecondaryFeatures'

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
          {/* <h1 className="m-8 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {data.post.title}
          </h1> */}
          {/* <ContentSection content={data.post.body}></ContentSection> */}
          {/* <div className="prose mx-auto ">
            <pre
              key={data.page.blocks.map((d) => `${d.__typename}-1`).join('-')}
            >
              {JSON.stringify(data.page.blocks, null, 2)}
            </pre>
          </div> */}
          {data.page?.blocks?.length > 0
            ? data.page.blocks.map(function (block, i) {
                switch (block.__typename) {
                  case 'PageBlocksHero':
                    return (
                      <React.Fragment key={i + block.__typename}>
                        <Hero headline={block.headline} text={block.text} />
                      </React.Fragment>
                    )
                  case 'PageBlocksContent':
                    return (
                      <React.Fragment key={i + block.__typename}>
                        <PrimaryFeatures />
                      </React.Fragment>
                    )
                  case 'PageBlocksFeatures':
                    return (
                      <React.Fragment key={i + block.__typename}>
                        <SecondaryFeatures />
                      </React.Fragment>
                    )
                  default:
                    return null
                }
              })
            : null}
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  let data = {}
  let query = {}
  let variables = { relativePath: `${params.filename}.md` }
  try {
    const res = await client.queries.page(variables)
    query = res.query
    data = res.data
    variables = res.variables
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      variables: variables,
      data: data,
      query: query,
      //myOtherProp: 'some-other-data',
    },
  }
}

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pageConnection()

  return {
    paths: pagesListData.data.pageConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  }
}

export default Page

const PageSection = (props) => {
  return (
    <>
      {/* <h2>{props.heading}</h2> */}
      {/* <p>{props.content}</p> */}
    </>
  )
}

const components = {
  PageSection: PageSection,
}

const ContentSection = ({ content }) => {
  return (
    <>
      <div className="relative overflow-hidden bg-white pb-16">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto text-lg">
            <TinaMarkdown components={components} content={content} />
          </div>
        </div>
      </div>
    </>
  )
}
