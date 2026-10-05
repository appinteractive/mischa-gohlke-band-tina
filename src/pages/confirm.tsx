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

  const [hasError, setHasError] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigation = normalizeNavigation({ ...props.data.nav })

  const { isReady, replace } = router

  useEffect(() => {
    if (!isReady) return

    const controller = new AbortController()
    setSuccess(false)
    setHasError(false)

    if (
      typeof email !== 'string' ||
      !email ||
      typeof hash !== 'string' ||
      !hash
    ) {
      setHasError(true)
      setSending(false)
      return
    }

    const parameters = new URLSearchParams({ email, hash })
    setSending(true)
    fetch(`/api/confirm?${parameters}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Confirmation request failed')
        const data = await res.json()
        if (controller.signal.aborted) return
        if (data?.body?.error || data?.body?.success !== true) {
          throw new Error('Confirmation was not accepted')
        }

        setSending(false)
        setSuccess(true)
        setHasError(false)

        // Navigate only after the confirmation endpoint accepted this request.
        void replace('/success')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setHasError(true)
        setSending(false)
        setSuccess(false)
      })

    return () => controller.abort()
  }, [email, hash, isReady, replace])

  return (
    <Layout navigation={navigation}>
      <div className="min-h-full">
        <div className="min-h-full grow px-4 pt-16 pb-32">
          {success && <Success />}
          {sending && <Loading />}
          {hasError && <ConfirmationError />}
        </div>
      </div>
    </Layout>
  )
}

const Loading = () => {
  return (
    <div className="mx-auto prose text-center leading-6">
      <h2 className="text-3xl!">Einen kleinen Moment…</h2>
      <p>…Dein Link wird überprüft.</p>
    </div>
  )
}

const ConfirmationError = () => {
  return (
    <div className="mx-auto prose text-center leading-6 prose-green">
      <h2 className="text-3xl!">Ups…</h2>
      <p className="text-lg">
        …Houston wir haben ein Problem. Meld dich einfach unter{' '}
        <a href="mailto:mail@mischagohlkeband.de">mail@mischagohlkeband.de</a>
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
