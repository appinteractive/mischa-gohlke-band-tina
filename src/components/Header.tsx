import { Fragment } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'
import MenuPopover from './layout/MenuPopover'
import { cleanPath } from '@/lib/utils'

export type MainNavItem = {
  title: string
  page: string
  disabled?: boolean
  showInMainNavigation?: boolean
  children?: MainNavItem[]
}

type Props = {
  items: MainNavItem[]
}

export function Header({ items }) {
  return (
    <header className="z-10 w-screen bg-white py-10">
      <Container className="">
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link
              href="/"
              aria-label="Home"
              className=" rounded outline-offset-8"
            >
              <Logo className="h-10 w-auto" />
            </Link>
          </div>
          <div className="hidden items-center font-semibold text-gray-900 md:flex md:gap-x-2">
            {items?.map((item) => {
              if (item.disabled) return null
              if (item.showInMainNavigation === false) return null

              if (item.children?.length) {
                return (
                  <MenuPopover
                    key={item.title}
                    label={item.title}
                    items={item.children ?? []}
                    isMultiLevel={item.isMultiLevel}
                  />
                )
              }
              return (
                <NavLink key={item.title} href={cleanPath(item.page)}>
                  {item.title}
                </NavLink>
              )
            })}
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            {/* <div className="hidden md:block">
              <NavLink href="/login">Sign in</NavLink>
            </div> */}
            {/* <Button className="" href="/spenden" color="blue">
              <span>Spenden</span>
            </Button> */}
            <div className="-mr-1 md:hidden">
              <MobileNavigation items={items} />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}

function MobileNavLink({ href, children, level = 1, key = null }) {
  return (
    <Popover.Button
      as={Link}
      key={key}
      href={href}
      className={clsx(
        'block w-full p-2',
        level > 1 && 'py-1.5 pl-4 text-base text-slate-500'
      )}
    >
      {children}
    </Popover.Button>
  )
}

function MobileNavIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0'
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0'
        )}
      />
    </svg>
  )
}

function MobileNavigation({ items }: Props) {
  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-slate-700/50 backdrop-blur-sm" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-lg bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5"
          >
            {items.map((item, index) => {
              if (item.disabled) return null
              if (item.showInMainNavigation === false) return null

              return (
                <div key={index.toString()}>
                  <MobileNavLink href={cleanPath(item.page)}>
                    {item.title}
                  </MobileNavLink>
                  {item.children?.map((itm, idx) => {
                    return (
                      <MobileNavLink
                        key={`${index.toString()}->${idx.toString()}`}
                        href={cleanPath(itm.page)}
                        level={2}
                      >
                        {itm.title}
                      </MobileNavLink>
                    )
                  })}
                </div>
              )
            })}
            {/* <hr className="m-2 border-slate-300/40" />
            <MobileNavLink href="/spenden">Spenden</MobileNavLink> */}
            {/* <MobileNavLink href="#features">Features</MobileNavLink>
            <MobileNavLink href="#testimonials">Testimonials</MobileNavLink>
            <MobileNavLink href="#pricing">Pricing</MobileNavLink>*/}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}
