import clsx from 'clsx'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { cleanPath } from '@/lib/utils'

const ResponsiveImage = dynamic(
  () => import('@/components/embeds/ResponsiveImage'),
  { ssr: false }
)

/**
 * used for displaying related content
 */
export default function ContentGallery({ type, hasSubNav, ...props }) {
  return (
    <div
      className={clsx(
        'not-prose relative max-w-7xl space-y-4',
        hasSubNav ? 'xl:-mr-[8vw]' : 'xl:-mx-[10vw]'
      )}
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {props?.pages?.slice(0, 3)?.map((item) => (
          <li key={item.page + item.teaser} className="relative flex flex-col ">
            <Link
              href={cleanPath(item.page)}
              className="rounded outline-offset-2 outline-slate-900"
            >
              <span className="aspect-h-8 aspect-w-16 relative block shrink-0">
                {item.teaser ? (
                  <Image
                    src={item.teaser}
                    alt={item.title}
                    // set sizes to 100vw when the screen is smaller than 768px and 768px when it's larger
                    sizes="(max-width: 768px) 100vw, (min-width: 768px) 768"
                    fill
                    blurDataURL={props.blurDataURL}
                    className="prose-no h-full shrink-0 rounded-md bg-black object-cover md:shadow"
                  />
                ) : (
                  <div className="prose-no h-full shrink-0 rounded-md bg-black object-cover md:shadow" />
                )}
              </span>
              <span className="block space-y-2 pb-4 pt-2">
                <h3 className="font-semibold leading-snug text-gray-800">
                  {item.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-normal text-gray-600">
                  {item.description}
                </p>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className=" grid gap-4 sm:grid-cols-2">
        {props?.pages?.slice(3, 12)?.map((item) => (
          <li key={item.page + item.teaser} className="relative flex flex-col ">
            <Link
              href={cleanPath(item.page)}
              className="not-prose relative flex h-full space-x-2 rounded outline-offset-2 outline-slate-900"
            >
              <span className="relative h-[5rem] min-w-[8rem]">
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
      {/* <div className="prose">
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div> */}
    </div>
  )
}
