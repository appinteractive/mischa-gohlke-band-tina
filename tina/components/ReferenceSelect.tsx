import { useCMS, wrapFieldsWithMeta } from 'tinacms'
import { Combobox, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  LinkIcon,
  ArrowRightIcon,
} from '@heroicons/react/20/solid'
import { cleanPath } from '../../src/lib/utils'
import {
  useFilteredOptions,
  useReference,
  useSelected,
} from './hooks/ReferenceHooks'
import clsx from 'clsx'

const selectClasses =
  'flex flex-col w-full appearance-none truncate rounded-md border border-gray-200 bg-white py-2 pl-2 pr-8 text-base shadow focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'

type ReferenceOption = {
  id: string
  title: string
}

function findById(
  options: ReferenceOption[],
  id: string
): ReferenceOption | null {
  return options.find((option) => option.id === id)
}

export const useReferenceSelect = wrapFieldsWithMeta(
  ({ field, input, meta }) => {
    const cms = useCMS()
    const [query, setQuery] = useState<string>('')
    const { loading, options } = useReference(cms, 'page')
    const selected = useSelected(options, input.value)
    const { filteredOptions, filteredStats } = useFilteredOptions(
      options,
      query
    )

    useEffect(() => {
      if (selected) {
        setQuery('')
      }
    }, [selected])

    if (loading === true) {
      return (
        <div
          className={clsx(
            selectClasses,
            'cursor-wait !bg-gray-100 text-gray-400'
          )}
        >
          bitte warten...
        </div>
      )
    }

    return (
      <Combobox
        as="div"
        value={input.value}
        onChange={input.onChange}
        onClick={() => {
          setTimeout(() => {
            setQuery('')
          }, 250)
        }}
      >
        {({ open }) => (
          <>
            <div className="relative mt-2">
              <div className={clsx(selectClasses, 'h-[53px]')}>
                <Combobox.Input
                  onChange={(e) => setQuery(e.target.value ?? '')}
                  placeholder="🔍 Seite Suchen"
                  title={
                    selected && `${selected?.title}\n${cleanPath(input.value)}`
                  }
                  className="absolute inset-0 flex h-[53px] w-full rounded-md bg-transparent !pt-[15px] pb-8 pl-3 pr-10 text-start focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  displayValue={(id) => {
                    setQuery('')
                    return findById(options, id.toString())?.title
                  }}
                />
                {filteredStats.isReduced && (
                  <span className="shrink-0 select-none truncate pl-1 pt-[20px] !text-xs text-gray-300">
                    {filteredStats.filtered > 0 && (
                      <>
                        {filteredStats.filtered} von {filteredStats.total}
                      </>
                    )}
                    {!filteredStats.filtered && <>Keine Ergebnisse</>}
                  </span>
                )}
                {!filteredStats.isReduced && selected && (
                  <span className="shrink-0 select-none truncate pl-1 pt-[20px] !text-xs text-gray-300">
                    <ArrowRightIcon className="mr-1 inline h-3 w-3" />
                    {cleanPath(input.value)}
                  </span>
                )}
                {!filteredStats.isReduced && !selected && (
                  <span className="shrink-0 select-none truncate pl-1 pt-[20px] !text-xs text-gray-300">
                    Bitte verknüpfe eine Seite
                  </span>
                )}
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-75 origin-top transform-gpu"
                enterFrom="transform opacity-0 scale-y-[0.97]"
                enterTo="transform opacity-100 scale-y-100"
                leave="transition ease-in duration-75 origin-top transform-gpu"
                leaveFrom="transform opacity-100 scale-y-100"
                leaveTo="transform opacity-0 scale-y-[0.97]"
              >
                <Combobox.Options
                  className={clsx(
                    'absolute !z-[1000] mt-1 !max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
                    filteredOptions.length < 1 && 'hidden'
                  )}
                >
                  {filteredOptions.length > 0 &&
                    filteredOptions.map(({ id, title }) => (
                      <Combobox.Option
                        key={id}
                        className={({ active }) =>
                          clsx(
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
                                className={clsx(
                                  selected ? 'font-semibold' : 'font-medium',
                                  '-mt-px truncate text-sm'
                                )}
                              >
                                {title}
                              </span>
                              <span
                                className={clsx(
                                  active ? 'text-indigo-200' : 'text-gray-300',
                                  'truncate text-xs'
                                )}
                              >
                                {cleanPath(id)}
                              </span>
                            </div>

                            <a
                              href={cleanPath(id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Öffne in neuem Tab"
                              onClick={(e) => {
                                // needed to prevent the combobox from closing
                                e.stopPropagation()
                              }}
                              className={clsx(
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
                                className={clsx(
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
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
              </Transition>
            </div>
          </>
        )}
      </Combobox>
    )
  }
)
