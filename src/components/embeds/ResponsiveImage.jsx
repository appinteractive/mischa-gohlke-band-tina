import Image from 'next/image'
import { BlurhashCanvas } from 'react-blurhash'

export const ResponsiveImage = (props) => {
  let caption = props.caption?.trim()
  const alt = props.alt?.trim()

  const hasAlt = alt && alt !== ''
  const title = hasAlt ? alt : props.caption?.trim()
  if (!hasAlt) caption = null
  const hasInfos = title || caption

  return (
    <figure className="not-prose aspect-w-16 aspect-h-9 relative my-5 flex items-center justify-end overflow-hidden rounded-md">
      <span>
        {props.blurDataURL && (
          <BlurhashCanvas
            hash={props.blurDataURL}
            punch={1}
            width={768}
            height={432}
            className="absolute inset-0 top-0 left-0 !h-full !w-full"
          />
        )}
        <Image
          src={props.url}
          alt={props.alt}
          // set sizes to 100vw when the screen is smaller than 768px and 768px when it's larger
          sizes="(max-width: 768px) 100vw, (min-width: 768px) 768"
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
