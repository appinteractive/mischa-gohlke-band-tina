import Head from 'next/head'
import { canonicalUrl, siteOrigin } from '@/lib/site-url.mjs'
import { pageMetadata, pageRobots } from '@/lib/page-metadata'
import {
  socialImageOrigin,
  socialImageUrl,
  SOCIAL_IMAGE_WIDTH,
  SOCIAL_IMAGE_HEIGHT,
} from '@/lib/social-image'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '@/tina/__generated__/client'
import React from 'react'

import Layout from '@/layouts/default'

import { addBlurHash } from '@/utils/blurhash'

import { isImage } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { deleteUndefinedValues, getSubNavigation } from '@/lib/breadcrumbs'
import { useRouter } from 'next/router'
import { normalizeNavigation } from '@/lib/nav-model'
import clsx from 'clsx'
import Link from 'next/link'

/* const Hero = dynamic(() => import('@/components/Hero')) */
const PrimaryFeatures = dynamic(() => import('@/components/PrimaryFeatures'))
const SecondaryFeatures = dynamic(
  () => import('@/components/SecondaryFeatures')
)
const Hero = dynamic(() => import('@/components/embeds/Hero'))
const VideoPlayer = dynamic(() => import('@/components/embeds/VideoPlayer'))
const VideoTeaser = dynamic(() => import('@/components/embeds/VideoTeaser'), {
  ssr: false,
})
const ResponsiveImage = dynamic(
  () => import('@/components/embeds/ResponsiveImage')
)
const ContentGallery = dynamic(
  () => import('@/components/embeds/ContentGallery')
)
const SocialMedia = dynamic(() => import('@/components/embeds/SocialMedia'))
const ImageGallery = dynamic(() => import('@/components/embeds/ImageGallery'))
const DonationForm = dynamic(() => import('@/components/embeds/DonationForm'))
const Team = dynamic(() => import('@/components/embeds/Team'))
const SubNav = dynamic(() => import('@/components/layout/SubNav'))

const Page = (props) => {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const router = useRouter()
  const currentUrl = router.asPath

  const { teamComponentProps, navigation, subNavigation, hasSubNav } =
    props.data

  const cmsComponents = useCmsComponents({
    hasSubNav,
    subNavigation,
    teamComponentProps,
  })

  const subNav =
    subNavigation?.items?.length > 0 ? (
      <SubNav items={subNavigation.items} parent={subNavigation.parent} />
    ) : null

  const teaser = socialImageUrl(props.socialImageOrigin, data.page?.teaser)

  const { title, description } = pageMetadata(
    data.page?.title,
    data.page?.description
  )
  // TODO: move default title, description, keywords and copyright to CMS

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={props.canonicalUrl} />
        <meta property="og:url" content={props.canonicalUrl} />
        <meta
          name="keywords"
          content="Kultur, Gesellschaft, Inklusion, Frieden, Projekte, Veranstaltungen, Kampagnen, Musikunterricht für Hörgeschädigte"
        />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={teaser} />
        <meta property="og:image:width" content={String(SOCIAL_IMAGE_WIDTH)} />
        <meta
          property="og:image:height"
          content={String(SOCIAL_IMAGE_HEIGHT)}
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={teaser} />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:type" content="website" />
        <meta
          name="robots"
          content={pageRobots(data.page?.isPlaceholder, props.isPreview)}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
      </Head>
      <Layout navigation={navigation} subNav={hasSubNav ? subNav : null}>
        {data.page?.blocks?.length > 0 ? (
          data.page.blocks.map(function (block, i) {
            switch (block.__typename) {
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
          <div className="mx-auto prose max-w-3xl">
            <TinaMarkdown
              content={data?.page?.body}
              components={cmsComponents}
            />
          </div>
        )}
      </Layout>
    </>
  )
}

function useCmsComponents({ hasSubNav, subNavigation, teamComponentProps }) {
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
        return <TinaMarkdown {...props} content={props} />
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
    VideoTeaser: (props) => <VideoTeaser hasSubNav={hasSubNav} {...props} />,

    a: (props) => {
      const href = props.url || props.href
      const target = href?.startsWith('http') ? '_blank' : '_self'
      let children = props.children

      if (href) {
        return (
          <Link href={href} {...props} target={target}>
            {children}
          </Link>
        )
      }

      return <>{children}</>
    },
    ContentGallery: (props) => (
      <ContentGallery hasSubNav={hasSubNav} {...props} />
    ),
    ImageGallery: (props) => (
      <ImageGallery hasSubNav={hasSubNav} images={props.images} {...props} />
    ),
    DonationForm: (props) => <DonationForm {...props} />,
    Team: (props) => <Team {...props} items={teamComponentProps?.items} />,
    Hero: (props) => <Hero {...props} hasSubNav={hasSubNav} />,
    SocialMedia: (props) => <SocialMedia {...props} hasSubNav={hasSubNav} />,
    img: (props) => {
      return <ResponsiveImage {...props} />
    },
  }
}

// TODO add paths for aliases too
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

export const getStaticProps = async ({ params, ...data }) => {
  // TODO: find a way to generate blur hashes on build or on upload
  /* if (
    typeof window === 'undefined' &&
    res.props?.data?.page?.body?.children?.length
  ) {
    for (const node of res.props.data.page.body.children) {
      await addBlurHash(node)
    }
  } */

  const path = params?.path ?? ['index']
  const [res, resNav] = await Promise.all([
    queryByPath(path.join('/') + '.mdx'),
    client.queries.nav(),
  ])
  // A path rendered on demand without a Tina page: a real 404, checked again
  // after a minute in case the page is created in Tina meanwhile.
  if (!res.props.data?.page) return { notFound: true, revalidate: 60 }

  // add res.nav.data to res.props.data
  res.props.data['nav'] = {
    footer: resNav?.data.navFooterConnection.edges[0]?.node._values,
    main: resNav?.data.navMainConnection.edges[0]?.node._values,
  }

  const currentUrl = '/' + path.join('/').replace('/index', '')
  const navigation = normalizeNavigation({ ...res.props.data['nav'] })
  const subNavigation =
    deleteUndefinedValues(getSubNavigation(navigation.main, currentUrl)) ?? null
  // check if subNav has more than one item or if that item has children
  const hasSubNav =
    subNavigation?.items?.length > 1 ||
    subNavigation?.items?.some((item) => item?.children?.length > 0)

  res.props.data['navigation'] = navigation ?? null
  res.props.data['subNavigation'] = subNavigation ?? null
  res.props.data['hasSubNav'] = hasSubNav === true

  const teamComponentProps = { items: null }
  const hasTeamComponent = res.props.data.page?.body?.children?.some(
    (child) => {
      return child?.name === 'Team'
    }
  )
  if (hasTeamComponent) {
    teamComponentProps.items = getSubNavigation(
      navigation.main,
      currentUrl,
      true
    )?.items
  }
  if (teamComponentProps.items?.length) {
    // get all page details for each team member
    const allPages = await client.request(
      {
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
                  title,
                  description,
                  teaser,
                }
              }
            }
          }
        }
      }
    `,
        variables: { collection: 'page' },
      },
      {}
    )
    teamComponentProps.items = teamComponentProps.items?.map((area) => {
      area.items = area?.children?.map((item) => {
        // url is the item.url without the preceding slash
        const url = item.url.replace(/^\//, '')

        const page = allPages?.data?.collection?.documents?.edges?.find(
          (page) =>
            page.node._sys.breadcrumbs
              ?.filter((x) => x !== 'index')
              ?.join('/') === url
        )
        if (page) {
          item.description = page.node.description
          item.teaser = page.node.teaser
        }
        return item
      })

      return area
    })
  }
  res.props.data['teamComponentProps'] =
    deleteUndefinedValues(teamComponentProps)

  res.props.socialImageOrigin = socialImageOrigin()
  res.props.canonicalUrl = canonicalUrl(siteOrigin(), '/' + path.join('/'))
  res.props.isPreview = process.env.VERCEL_ENV === 'preview'
  return res
}

export const getStaticPaths = async () => {
  const response = await client.request(
    {
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
    },
    {}
  )

  const paths = response.data.collection.documents.edges.map((page) => ({
    params: {
      path: page.node._sys.breadcrumbs?.filter((x) => x !== 'index') ?? [],
    },
  }))

  return {
    paths,
    // Pages created in Tina after the last build render on their first
    // request instead of answering 404 until the next deploy.
    fallback: 'blocking',
  }
}

export default Page
