import { TinaCMS, useCMS, wrapFieldsWithMeta } from 'tinacms'
import { Listbox, Transition } from '@headlessui/react'
import React, { Fragment, useEffect } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import client from '../__generated__/client'
import { uiUseTitle } from './utils'

function classNames(...classes) {
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
      setLoading(false)
    }

    if (cms && collections.length > 0) {
      fetchOptionSets()
    } else {
      setOptionSets([])
    }
  }, [cms, collections])

  return { optionSets, loading }
}

const cleanPath = (path: string) => {
  // replace ^content/pages/ and .mdx$
  return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
}

const selectClasses =
  'block w-full cursor-pointer appearance-none truncate rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-base shadow focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'

export const footer: any = {
  name: 'footer',
  label: 'Footer',
  fields: [
    {
      type: 'object',
      name: 'footerMenu',
      nameOverride: 'menu',
      label: 'Reiter',
      list: true,
      ui: {
        itemProps: uiUseTitle(),
      },
      fields: [
        {
          type: 'string',
          name: 'title',
          nameOverride: 'footerTitle',
          label: 'Titel',
          isTitle: true,
          required: true,
        },
        {
          type: 'object',
          list: true,
          name: 'children',
          nameOverride: 'footerChildren',
          label: 'Unterpunkte',
          ui: {
            itemProps: uiUseTitle(),
          },
          fields: [
            {
              type: 'string',
              name: 'title',
              label: 'Titel',
              isTitle: true,
              required: true,
            },
            {
              type: 'reference',
              name: 'page',
              label: 'Seite',
              required: true,
              collections: ['page'],
              ui: {
                component: wrapFieldsWithMeta(({ field, input, meta }) => {
                  const cms = useCMS()
                  const { optionSets, loading } = useGetOptionSets(cms, [
                    'page',
                  ])

                  const [selected, setSelected] = React.useState()
                  useEffect(() => {
                    if (optionSets?.length < 1) return

                    console.log('SELECT', input.value)
                    setSelected(input.value)
                    // find input.value in optionSets
                    const title = optionSets[0].edges.find(
                      (edge) => edge?.node?.id === input?.value
                    )!.node._internalSys.title as any
                    setSelected(title as any)
                  }, [input.value, loading])
                  const setItem = (item: any) => {
                    input.onChange(item)
                  }

                  /*  return (
                    <pre>
                      {JSON.stringify(
                        {
                          selected,
                          field,
                          input,
                          meta,
                        },
                        null,
                        2
                      )}
                    </pre>
                  ) */

                  if (loading === true) {
                    return (
                      <div
                        className={`${selectClasses} cursor-wait !bg-gray-100`}
                      >
                        bitte warten...
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* <pre>
                        {JSON.stringify(
                          {
                            selected,
                            field,
                            input,
                            meta,
                          },
                          null,
                          2
                        )}
                      </pre> */}
                      <Listbox value={input.value} onChange={input.onChange}>
                        {({ open }) => (
                          <>
                            {/* <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                            Assigned to
                          </Listbox.Label> */}
                            <div className="relative mt-2">
                              <Listbox.Button className={selectClasses}>
                                <span className="flex w-full flex-col items-start truncate leading-tight">
                                  <span className="truncate">{selected}</span>
                                  <span className="truncate !text-xs text-gray-300">
                                    {cleanPath(input.value)}
                                  </span>
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
                                <Listbox.Options className="absolute z-10 mt-1 !max-h-[50vh] w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                              'relative cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                          }
                                          value={id}
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <div className="flex flex-col">
                                                <span
                                                  className={classNames(
                                                    selected
                                                      ? 'font-semibold'
                                                      : 'font-normal',
                                                    'truncate'
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

                                              {selected ? (
                                                <span
                                                  className={classNames(
                                                    active
                                                      ? 'text-white'
                                                      : 'text-indigo-600',
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
                    </>
                  )

                  /* return (
                    <select
                      id={input.name}
                      value={input.value}
                      onChange={input.onChange}
                      className={selectClasses}
                      {...input}
                    >
                      <option value={''}>Choose an option</option>
                      {optionSets.length > 0 &&
                        optionSets.map(({ collection, edges }: OptionSet) => (
                          <optgroup
                            key={`${collection}-group`}
                            label={collection}
                          >
                            {edges.map(
                              ({
                                node: {
                                  id,
                                  _internalSys: { title },
                                },
                              }) => (
                                <option key={`${id}-option`} value={id}>
                                  {title || id}
                                </option>
                              )
                            )}
                          </optgroup>
                        ))}
                    </select> */

                  /* return (
                    <div>
                      <pre>
                        {JSON.stringify(
                          {
                            optionSets,
                            field,
                            input,
                            meta,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  ) */
                }),
              },
            },
          ],
        },
      ],
    },
  ],
}
