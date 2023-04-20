import {
  IconArrowLeft,
  IconArrowRight,
  IconCornerDownRight,
} from '@tabler/icons-react'
import clsx from 'clsx'
import Link from 'next/link'

export function subNav({ items, parent = null }) {
  return (
    <aside className="mb-12 min-w-[15rem] rounded border bg-slate-100 px-6 py-4 md:h-full md:w-64 md:border-transparent md:bg-transparent md:p-6 md:pl-0 md:pr-6 md:pt-0 lg:w-72">
      <nav
        className="top-20 pb-12 md:sticky"
        aria-label="Unternavigation"
        role="menu"
      >
        <ul className="prose-a:font-normal prose-a:no-underline">
          {/* {parent?.title && (
            <li className="-ml-1.5 pb-3">
              <Link
                href={parent.url}
                className="flex items-start space-x-1.5 py-1.5 !font-bold leading-tight"
              >
                <IconArrowLeft
                  aria-hidden="true"
                  className="mt-[0.2em] block h-4 w-4 shrink-0 opacity-100 transition-all duration-75"
                />
                <span>{parent.title}</span>
              </Link>
            </li>
          )} */}
          {items.map((level1, index1) => (
            <li key={index1}>
              <Link
                href={level1.url}
                className={clsx([
                  'flex items-start space-x-2 rounded py-1.5 leading-tight outline-offset-4',
                  level1.active && '!font-semibold',
                ])}
              >
                <IconArrowRight
                  aria-hidden="true"
                  className={clsx(
                    'mt-[0.15em] block h-4 w-4 shrink-0 transition-all duration-75',
                    level1.active ? 'opacity-100' : 'opacity-50'
                  )}
                />
                <span>{level1.title}</span>
              </Link>
              {level1.children?.length > 0 && (
                <ul className="pl-5">
                  {level1.children.map((level2, index2) => (
                    <li key={index2}>
                      <Link
                        href={level2.url}
                        className={clsx([
                          'flex space-x-2 rounded py-1 text-sm leading-tight outline-offset-4',
                          level2.active && '!font-semibold',
                        ])}
                      >
                        <IconCornerDownRight
                          aria-hidden="true"
                          className={clsx(
                            'mt-[0.1em] block h-3 w-3 shrink-0 transition-all duration-75',
                            level2.active ? 'opacity-100' : 'opacity-50'
                          )}
                        />
                        <span>{level2.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default subNav
