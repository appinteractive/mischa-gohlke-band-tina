import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { NormalizedNav } from '@/lib/nav-model'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  navigation?: NormalizedNav
  subNav?: React.ReactNode
}

export default function Layout({
  children,
  navigation,
  subNav,
  ...props
}: Props) {
  return (
    <>
      <Header items={navigation?.main ?? []} />
      <div id="video-teaser-container" />
      <main
        className={clsx(
          'relative mx-auto w-full max-w-7xl grow flex-row-reverse items-start space-y-24 px-6 pb-12 pt-10 md:flex md:space-y-0 md:py-20 lg:pb-32',
          subNav ? 'has-subnav justify-end' : 'justify-center'
        )}
      >
        <section className="w-full">{children}</section>
        {subNav}
      </main>
      <Footer items={navigation?.footer ?? []} />
    </>
  )
}
