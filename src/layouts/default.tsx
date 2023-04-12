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
      <div className="absolute inset-0 -top-[40rem] -z-[1] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/beams-home@95.jpg"
          alt=""
          className="-ml-[40rem] w-[163.125rem] max-w-none sm:-ml-[67.5rem]"
        />
      </div>
      {/* <pre>{JSON.stringify(navigation?.main ?? [], null, 2)}</pre> */}
      <Header items={navigation?.main ?? []} />
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
