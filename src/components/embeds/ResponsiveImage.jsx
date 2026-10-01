import Image from 'next/image'
import { BlurhashCanvas } from 'react-blurhash'
import clsx from 'clsx'
import { imageUrl } from '@/lib/image-loader'

// The figure below is a fixed 16:9 letterbox with object-contain, so an
// image can never display taller than width * 9/16 — cap the resize height
// too, otherwise portrait images are fetched far larger than they render.
const letterboxLoader = ({ src, width, quality }) =>
  imageUrl({ src, width, height: Math.round((width * 9) / 16), quality })

// TinaCMS's rich-text editor can corrupt saved image URLs by prepending the
// mediaRoot path onto an already-absolute URL (e.g. `/mediahttps://...jpg`).
// Guard against that by keeping only the last absolute URL in the string.
const normalizeImageUrl = (url) => {
  if (typeof url !== 'string') return url
  const lastHttpIndex = url.lastIndexOf('https://')
  return lastHttpIndex > 0 ? url.slice(lastHttpIndex) : url
}

export const ResponsiveImage = (props) => {
  let caption = props.caption?.trim()
  const alt = props.alt?.trim()

  const hasAlt = alt && alt !== ''
  const title = hasAlt ? alt : props.caption?.trim()

  if (caption === title) caption = null
  if (!hasAlt) caption = null

  const hasInfos = title || caption

  return (
    <figure
      className={clsx(
        'not-prose aspect-h-9 aspect-w-16 relative my-5 flex items-center justify-end overflow-hidden rounded-md',
        props.className
      )}
    >
      <span>
        {props.blurDataURL && (
          <BlurhashCanvas
            hash={props.blurDataURL}
            punch={1}
            width={768}
            height={432}
            className="absolute inset-0 left-0 top-0 !h-full !w-full"
          />
        )}
        <Image
          src={normalizeImageUrl(props.url)}
          alt={props.alt}
          loader={letterboxLoader}
          // 100vw below 768px, fixed 768px content width above
          sizes="(max-width: 768px) 100vw, 768px"
          fill
          blurDataURL={props.blurDataURL}
          className={`prose-no ${
            props.blurDataURL ? 'bg-transparent' : 'bg-black'
          } object-contain`}
        />
      </span>
      {hasInfos && (
        <figcaption className="absolute flex w-full flex-col !justify-end !place-self-end !self-end !justify-self-end">
          <span className="flex flex-col bg-gray-900/70 p-4 px-5 leading-5 backdrop-blur-sm">
            <span className="font-semibold text-white">{title}</span>
            {caption && (
              <span className="text-sm text-gray-200">{caption}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  )
}

export default ResponsiveImage
