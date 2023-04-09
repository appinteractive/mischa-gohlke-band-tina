import { TinaCMS, useCMS, wrapFieldsWithMeta } from 'tinacms'
import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment, useEffect } from 'react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  LinkIcon,
} from '@heroicons/react/20/solid'
import { cleanPath } from '../../src/lib/utils'

/* @vite-ignore */

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

type Option = {
  value: string
  label: string
}

export interface ReferenceFieldProps {
  label?: string
  name: string
  component: string
  collections: string[]
  options: (Option | string)[]
}

export interface ReferenceProps {
  name: string
  input: any
  field: ReferenceFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

interface ReferenceSelectProps {
  cms: TinaCMS
  input: any
  field: ReferenceFieldProps
}

interface Node {
  id: string
  _internalSys: {
    title: string | null
  }
}
interface OptionSet {
  collection: string
  edges: {
    node: Node
  }[]
}

interface Response {
  collection: {
    documents: {
      edges: {
        node: Node
      }[]
    }
  }
}

const useGetOptionSets = (cms: TinaCMS, collections: string[]) => {
  const [optionSets, setOptionSets] = React.useState<OptionSet[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchOptionSets = async () => {
      const optionSets = await Promise.all(
        collections.map(async (collection) => {
          try {
            const response: Response = await cms.api.tina.request(
              `#graphql
            query ($collection: String!){
              collection(collection: $collection) {
                documents(first: -1) {
                  edges {
                    node {
                      ...on Node {
                        id,
                      }
                      ...on Document {
                        _internalSys: _sys {
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
              { variables: { collection } }
            )

            return {
              collection,
              edges: response.collection.documents.edges,
            }
          } catch (e) {
            return {
              collection,
              edges: [],
            }
          }
        })
      )

      setOptionSets(optionSets)

      // save optionSets to localStorage
      localStorage.setItem('optionSets', JSON.stringify(optionSets, null, 2))

      setLoading(false)
      return
    }
    // set optionSets from localStorage
    const cache = localStorage.getItem('optionSets')
    if (!optionSets?.length && cache) {
      setOptionSets(JSON.parse(cache))
      setLoading(false)
    }

    if (cms && collections.length > 0) {
      fetchOptionSets()
    }
  }, [cms, collections])

  return { optionSets, loading }
}

const selectClasses =
  'block w-full cursor-pointer appearance-none truncate rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-base shadow focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'

export const useReferenceSelect = wrapFieldsWithMeta(
  ({ field, input, meta }) => {
    const cms = useCMS()
    const { optionSets, loading } = useGetOptionSets(cms, ['page'])
    const [isMounted, setMounted] = React.useState(true)

    const [selected, setSelected] = React.useState()
    useEffect(() => {
      if (!isMounted) return
      if (optionSets?.length < 1) return

      setSelected(input.value)

      // find input.value in optionSets
      try {
        const title = optionSets[0].edges.find(
          (edge) => edge?.node?.id === input?.value
        )!.node._internalSys.title as any
        setSelected(title as any)
      } catch (e) {}

      return () => {
        setMounted(false)
      }
    }, [input.value, loading])

    if (loading === true) {
      return (
        <div
          className={classNames(
            selectClasses,
            'cursor-wait !bg-gray-100 text-gray-400'
          )}
        >
          bitte warten...
        </div>
      )
    }

    return (
      <Listbox value={input.value} onChange={input.onChange}>
        {({ open }) => (
          <>
            {/* <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                            Assigned to
                          </Listbox.Label> */}
            <div className="relative mt-2">
              <Listbox.Button className={selectClasses}>
                <span className="flex w-full flex-col items-start truncate leading-tight">
                  {!selected && (
                    <>
                      <span className="!text-md shrink-0 truncate text-gray-300">
                        Seite verknüpfen…
                      </span>
                    </>
                  )}
                  {selected && (
                    <>
                      <span className="!text-md shrink-0 truncate">
                        {selected}
                      </span>
                      <span className="shrink-0 truncate !text-xs text-gray-300">
                        {cleanPath(input.value)}
                      </span>
                    </>
                  )}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute !z-[1000] mt-1 !max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {optionSets.length > 0 &&
                    optionSets[0].edges.map(
                      ({
                        node: {
                          id,
                          _internalSys: { title },
                        },
                      }) => (
                        <Listbox.Option
                          key={id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-3 pr-14'
                            )
                          }
                          value={id}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="group flex flex-col leading-tight">
                                <span
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-medium',
                                    '-mt-px truncate text-sm'
                                  )}
                                >
                                  {title}
                                </span>
                                <span
                                  className={classNames(
                                    active
                                      ? 'text-indigo-200'
                                      : 'text-gray-300',
                                    'truncate text-xs'
                                  )}
                                >
                                  {cleanPath(id)}
                                </span>
                              </div>

                              <a
                                href={cleanPath(id)}
                                target="_blank"
                                title="Öffne in neuem Tab"
                                className={classNames(
                                  selected ? '' : 'hidden',
                                  'absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 hover:text-white'
                                )}
                              >
                                <LinkIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </a>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? '!hidden ' : 'text-indigo-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      )
                    )}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    )
  }
)
