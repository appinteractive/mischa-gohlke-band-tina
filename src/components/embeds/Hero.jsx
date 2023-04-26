import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { cleanPath } from '@/lib/utils'

function defaultText(text, defaultText) {
  return (text ?? '').trim() != '' ? text.trim() : defaultText
}

/**
 * used for displaying related content
 */
export default function Hero({ type, hasSubNav, ...props }) {
  const pages = props?.pages ?? []
  const title = defaultText(props?.title, 'Überschrift')
  const description = defaultText(props?.description, 'Einleitung')
  const buttonLabel = defaultText(props?.buttonLabel, 'Mehr erfahren')
  const buttonUrl =
    props?.buttonUrl?.trim() != '' ? cleanPath(props?.buttonUrl?.trim()) : '/'

  const featured = pages.length > 0 ? pages[0] : null

  return (
    <div
      className={clsx(
        'not-prose relative max-w-7xl space-y-4',
        hasSubNav ? 'lg:-mr-[8vw]' : 'lg:-mx-[10vw]'
      )}
    >
      <div className=" grid gap-6 lg:grid-cols-2">
        <div className="mx-auto pr-5 text-center lg:text-left">
          <h1 className="text-4xl font-bold !leading-tight tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 lg:mx-0 lg:max-w-lg">
            {description}
          </p>
          <div className="mx-auto mt-10 flex w-full items-center justify-center gap-x-6 lg:justify-start">
            <Link
              href={buttonUrl}
              className="group inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 hover:text-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-800 active:text-slate-100"
            >
              {buttonLabel} <span aria-hidden="true">→</span>
            </Link>
            {/* <Link
              href={buttonUrl}
              className="rounded text-sm font-semibold leading-6 text-gray-900 outline-offset-8"
            >
              {buttonLabel} <span aria-hidden="true">→</span>
            </Link> */}
          </div>
        </div>
        <div className="mt-20 space-y-4 sm:mt-24 lg:mx-0 lg:mt-0">
          <div className="relative flex flex-col">
            {featured && (
              <Link
                href={cleanPath(featured.page)}
                className="overflow-hidden rounded-lg outline-offset-2 outline-slate-900"
              >
                <span className="aspect-h-8 aspect-w-16 relative flex shrink-0">
                  {featured.teaser ? (
                    <Image
                      src={featured.teaser}
                      alt={featured.title}
                      // set sizes to 100vw when the screen is smaller than 768px and 768px when it's larger
                      sizes="(max-width: 768px) 100vw, (min-width: 768px) 768"
                      fill
                      blurDataURL={props.blurDataURL}
                      className="prose-no h-full shrink-0 rounded-md bg-black object-cover md:shadow"
                    />
                  ) : (
                    <div className="prose-no h-full shrink-0 rounded-md bg-black object-cover md:shadow" />
                  )}
                  <span className="bottom-0 flex h-full flex-col justify-end space-y-2 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-gray-900/10 p-4 pb-4 pt-2">
                    <h3 className="text-2xl font-semibold leading-snug text-white">
                      {featured.title}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-normal text-gray-50">
                      {featured.description}
                    </p>
                  </span>
                </span>
              </Link>
            )}
            {!featured && (
              <div className="prose-no aspect-h-8 aspect-w-16 shrink-0 rounded-md bg-black object-cover md:shadow" />
            )}
          </div>
          <ul className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {pages?.slice(1, 5)?.map((item) => (
              <li
                key={item.page + item.teaser}
                className="relative flex flex-col "
              >
                <Link
                  href={cleanPath(item.page)}
                  className="not-prose relative flex h-full space-x-2 rounded outline-offset-2 outline-slate-900"
                >
                  <span className="relative h-[4rem] min-w-[5rem]">
                    <Image
                      src={item.teaser}
                      alt={item.title}
                      // set sizes to 100vw when the screen is smaller than 768px and 768px when it's larger
                      sizes="(max-width: 768px) 100vw, (min-width: 768px) 768"
                      fill
                      blurDataURL={props.blurDataURL}
                      className="prose-no h-full rounded bg-black object-cover md:shadow"
                    />
                  </span>
                  <span className="block h-full space-y-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-normal text-gray-600">
                      {item.description}
                    </p>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
