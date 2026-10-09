import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { NormalizedNav } from '@/lib/nav-model'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  navigation?: NormalizedNav
  subNav?: React.ReactNode
  hasVideoTeaser?: boolean
}

export default function Layout({
  children,
  navigation,
  subNav,
  hasVideoTeaser,
  ...props
}: Props) {
  return (
    <>
      <Header items={navigation?.main ?? []} />
      {/* VideoTeaser portals in here after hydration; reserve its height in
          the server HTML so the content below does not shift. shrink-0: an
          empty child of the full-height #__next flex column collapses to 0. */}
      <div
        id="video-teaser-container"
        className={hasVideoTeaser ? 'h-100 shrink-0 bg-black' : undefined}
      />
      <main
        className={clsx(
          'relative mx-auto w-full max-w-7xl grow flex-row-reverse items-start space-y-24 px-6 pt-10 pb-12 md:flex md:space-y-0 md:py-20 lg:pb-32',
          subNav ? 'justify-end' : 'justify-center'
        )}
      >
        <section className="w-full">{children}</section>
        {subNav}
      </main>
      <Footer items={navigation?.footer ?? []} />
    </>
  )
}
