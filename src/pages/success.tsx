import Layout from '@/layouts/default'
import { normalizeNavigation } from '@/lib/nav-model'
import client from '@/tina/__generated__/client'

const Page = (props) => {
  const navigation = normalizeNavigation({ ...props.data.nav })

  return (
    <Layout navigation={navigation}>
      <div className="min-h-full">
        <div className="min-h-full grow px-4 pb-32 pt-16">
          <Success />
        </div>
      </div>
    </Layout>
  )
}

export const Success = ({ ...props }) => {
  return (
    <div className="prose prose-green mx-auto text-center leading-6">
      <h2 className="!text-primary !text-3xl">Glückwunsch</h2>
      <h3 className="!text-primary">Du stehst nun auf der Liste!</h3>
      <p className="text-secondary">
        Halt die Ohren steif, Du wirst bald von uns hören 🚀
      </p>
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
