// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
// This is a demo file once you have tina setup feel free to delete this file

import Head from 'next/head'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/.tina/__generated__/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const BlogPage = (props) => {
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
        <div className="prose mx-auto">
          <h1 className="m-8 text-center text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {data.post.title}
          </h1>
          <ContentSection content={data.post.body}></ContentSection>
        </div>
        {/* <div className="bg-green-100 text-center">
          Lost and looking for a place to start?
          <a
            href="https://tina.io/guides/tina-cloud/getting-started/overview/"
            className="text-blue-500 underline"
          >
            {' '}
            Check out this guide
          </a>{' '}
          to see how add TinaCMS to an existing Next.js site.
        </div> */}
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
    const res = await client.queries.post(variables)
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
  const postsListData = await client.queries.postConnection()

  return {
    paths: postsListData.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: false,
  }
}

export default BlogPage

const PageSection = (props) => {
  return (
    <>
      <h2>{props.heading}</h2>
      <p>{props.content}</p>
    </>
  )
}

const components = {
  PageSection: PageSection,
}

const ContentSection = ({ content }) => {
  return (
    <>
      <div className="relative overflow-hidden bg-white py-16">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-prose text-lg">
            <TinaMarkdown components={components} content={content} />
          </div>
        </div>
      </div>
    </>
  )
}
