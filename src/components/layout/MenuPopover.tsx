import { Fragment, useEffect, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  DocumentChartBarIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  ArrowRightIcon,
  ArrowDownRightIcon,
} from '@heroicons/react/24/outline'
import { InformationCircleIcon } from '@heroicons/react/24/solid'

import { IconCornerDownRight, IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import { cleanPath } from '@/lib/utils'

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export default function MenuPopover({ label, items, isMultiLevel = false }) {
  const [activeItem, setActiveItem] = useState(isMultiLevel ? items[0] : null)
  useEffect(() => {
    if (isMultiLevel) {
      setActiveItem(items[0])
    }
  }, [items, isMultiLevel])

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 px-3 py-3 text-sm font-semibold leading-6 text-slate-700 [&:not(:focus-visible)]:focus:outline-none">
        {({ open }) => (
          <>
            <span className={open && 'text-indigo-700'}>{label}</span>
            <ChevronDownIcon
              className={classNames('h-5 w-5', open && 'text-indigo-700')}
              aria-hidden="true"
            />
          </>
        )}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          className={`absolute left-1/2 z-10 mt-2 flex w-screen max-w-max px-4 drop-shadow-xl ${
            isMultiLevel
              ? '!fixed !left-0 lg:!absolute lg:-translate-x-1/3'
              : 'max-w-xs -translate-x-1/2'
          }`}
        >
          {({ close }) => (
            <div
              className={classNames(
                'w-screen flex-auto overflow-hidden rounded-xl bg-white text-sm leading-6 shadow-xl ring-1 ring-gray-900/5',
                isMultiLevel ? 'lg:max-w-3xl' : ' max-w-md lg:max-w-xs'
              )}
            >
              <div className="flex">
                <div className={isMultiLevel ? `grid grid-cols-2 gap-y-1` : ''}>
                  <div className={classNames('p-1.5', isMultiLevel && 'pr-0')}>
                    {items.map((item) => {
                      if (
                        item.disabled === true ||
                        item.showInMainNavigation === false
                      ) {
                        return null
                      }
                      return itemLevel1({
                        page: item.page,
                        label: item.title,
                        showIcon: isMultiLevel,
                        close,
                        active: activeItem === item,
                        large: isMultiLevel,
                        onMouseEnter: () =>
                          isMultiLevel ? setActiveItem(item) : null,
                      })
                    })}
                  </div>
                  {isMultiLevel && (
                    <div className="m-1.5 ml-0 rounded-tr-md bg-slate-100 p-2">
                      {activeItem.children.map((item) => {
                        if (
                          item.disabled === true ||
                          item.showInMainNavigation === false ||
                          item.page === null
                        ) {
                          return null
                        }

                        return itemLevel2({
                          page: item.page,
                          label: item.title,
                          description: item.description,
                          close,
                        })
                      })}
                    </div>
                  )}
                </div>
                {/* hack so the menu does height does not jump */}
                {isMultiLevel && (
                  <div className="flex w-0 overflow-hidden" aria-hidden>
                    <div className="flex max-w-none py-8">
                      {items.map((item) => {
                        return (
                          <div
                            key={item.title}
                            aria-hidden
                            className="invisible m-2 ml-0 shrink-0 rounded-tr-md bg-slate-100 p-2"
                          >
                            {item.children.map((itm) => {
                              if (
                                itm.disabled === true ||
                                itm.showInMainNavigation === false ||
                                itm.page === null
                              ) {
                                return null
                              }

                              return itemLevel2({
                                page: itm.page,
                                label: itm.title,
                                description: itm.description,
                                close,
                              })
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              {isMultiLevel && (
                <div className="group bg-slate-100">
                  <Link
                    href="/spenden"
                    onClick={() => close()}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <span className="flex items-center space-x-2">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium leading-6 text-gray-600">
                        Wir sind ein gemeinnütziger Verein.
                      </p>
                    </span>
                    <span className="flex items-center justify-center space-x-2 text-gray-900 group-hover:text-indigo-700">
                      <span>Spenden</span>
                      <IconArrowRight
                        aria-hidden="true"
                        className="block h-4 w-4 transition-all duration-75 group-hover:-mr-1 group-hover:ml-3"
                      />
                    </span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}

function itemLevel1({
  page,
  label,
  close,
  showIcon = true,
  active = false,
  large = false,
  onMouseEnter = () => {},
}) {
  return (
    <div
      key={label}
      onMouseEnter={onMouseEnter}
      className={classNames(
        'group relative flex items-center gap-x-3  text-gray-800 hover:bg-slate-100 hover:text-indigo-700',
        large ? 'rounded-l-lg p-5' : 'rounded-lg p-4',
        active && 'bg-slate-100 !text-indigo-700'
      )}
    >
      {showIcon && (
        <IconArrowRight
          className={classNames(
            'h-4 w-4 shrink-0 opacity-20 transition-opacity duration-75 group-hover:opacity-100',
            active && '!opacity-100'
          )}
          aria-hidden="true"
        />
      )}
      <div>
        <Link
          href={cleanPath(page)}
          onClick={() => close()}
          className="font-semibold "
        >
          <span className="!line-clamp-2 flex leading-snug">{label}</span>
          <span className="absolute inset-0" />
        </Link>
      </div>
    </div>
  )
}

function itemLevel2({ page, label, description, close }) {
  return (
    <div
      key={label}
      className="text group group relative flex gap-x-3 rounded-lg p-4 px-6 text-gray-700 hover:bg-slate-100"
    >
      {/* <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white"> */}
      <IconCornerDownRight
        className="mt-px h-4 w-4 shrink-0 opacity-20 transition-opacity duration-75 group-hover:text-indigo-700 group-hover:opacity-100"
        aria-hidden="true"
      />
      {/* </div> */}
      <div className="">
        <Link
          href={cleanPath(page)}
          onClick={() => close()}
          className="font-semibold group-hover:text-indigo-700"
        >
          <span className="!line-clamp-2 flex leading-snug ">{label}</span>
          <span className="absolute inset-0 z-10" />
        </Link>
        <p className="mt-1 flex text-xs font-medium leading-normal opacity-80">
          {description}
        </p>
      </div>
    </div>
  )
}
