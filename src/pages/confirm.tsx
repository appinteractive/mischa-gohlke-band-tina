import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { normalizeNavigation } from '@/lib/nav-model'
import Layout from '@/layouts/default'
import client from '@/tina/__generated__/client'
import querystring from 'querystring'
import { Success } from '@/pages/success'

const Confirm = ({ ...props }) => {
  const router = useRouter()
  const query = router.asPath.split('?')[1] // get the query string from the URL
  const { email, hash } = querystring.parse(query) // parse the query string

  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigation = normalizeNavigation({ ...props.data.nav })

  useEffect(() => {
    if (mounted || sending) return
    setMounted(true)

    if (!email || !hash) {
      setHasError(true)
      setSending(false)
      setSuccess(false)
      return
    }

    const onError = (err) => {
      console.error(err)
      setHasError(true)
      setSending(false)
      setSuccess(false)
    }

    const url = `/api/confirm?email=${email}&hash=${hash}`
    setSending(true)
    fetch(url)
      .then(async (res) => {
        const { body } = await res.json()
        const { error, message } = body

        if (error) {
          onError(message)
          return
        }

        setSending(false)
        setSuccess(true)
        setHasError(false)

        // replace the current URL with the success page
        router.replace(window.location.toString(), '/success', {
          shallow: true,
        })
      })
      .catch((err) => {
        onError(err)
      })
  }, [mounted, email, hash, sending, router])

  return (
    <Layout navigation={navigation}>
      <div className="min-h-full">
        <div className="min-h-full grow px-4 pb-32 pt-16">
          {success && <Success />}
          {sending && <Loading />}
          {hasError && <Error />}
        </div>
      </div>
    </Layout>
  )
}

const Loading = () => {
  return (
    <div className="prose mx-auto text-center leading-6">
      <h2 className="!text-primary !text-3xl">Einen kleinen Moment…</h2>
      <p className="text-secondary">…Dein Link wird überprüft.</p>
    </div>
  )
}

const Error = () => {
  return (
    <div className="prose prose-green mx-auto text-center leading-6">
      <h2 className="!text-primary !text-3xl">Ups…</h2>
      <p className="text-secondary text-lg">
        …Houston wir haben ein Problem. Meld dich einfach unter{' '}
        <a href="mailto:mail@grenzensindrelativ.de">
          mail@grenzensindrelativ.de
        </a>
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

export default Confirm
