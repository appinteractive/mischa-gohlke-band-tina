import Head from 'next/head'
import Layout from '@/layouts/default'
import { normalizeNavigation } from '@/lib/nav-model'
import client from '@/tina/__generated__/client'

const Page = (props) => {
  const navigation = normalizeNavigation({ ...props.data.nav })

  return (
    <>
      <Head>
        <title>Newsletter-Anmeldung bestätigt | Mischa Gohlke Band</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Layout navigation={navigation}>
        <div className="min-h-full">
          <div className="min-h-full grow px-4 pt-16 pb-32">
            <Success />
          </div>
        </div>
      </Layout>
    </>
  )
}

export const Success = ({ ...props }) => {
  return (
    <div className="mx-auto prose text-center leading-6 prose-green">
      <h2 className="text-3xl!">Glückwunsch</h2>
      <h3>Du stehst nun auf der Liste!</h3>
      <p>Halt die Ohren steif, Du wirst bald von uns hören 🚀</p>
    </div>
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

export default Page
