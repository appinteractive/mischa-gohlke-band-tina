import clsx from 'clsx'
import Image from 'next/image'
import { Gallery } from 'react-grid-gallery'
import { useEffect, useState, useMemo, useLayoutEffect } from 'react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

/**
 * used for displaying images in a grid
 */
export default function ImageGallery({ type, hasSubNav, images, ...props }) {
  const items = (images ?? []).map((item, index) => {
    const { src, alt, caption, width, height } = item
    return {
      src,
      width,
      height,
      alt,
      caption,
    }
  })

  // reactive window width
  const [width, setWidth] = useState(0)

  // throttle the resize event
  useEffect(() => {
    let timer
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setWidth(window.innerWidth), 100)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      className={clsx(
        'not-prose relative max-w-7xl',
        hasSubNav ? 'xl:-mr-[8vw]' : 'xl:-mx-[10vw]'
      )}
    >
      <Gallery
        key={`w-${width}`} // force re-render on window resize
        images={items}
        enableImageSelection={false}
        thumbnailImageComponent={ImageThumbnail}
      />
    </div>
  )
}

function ImageThumbnail({
  item: { src, alt, caption, width, height },
  ...props
}) {
  return (
    <div className="gallery-image h-full w-full">
      <Zoom
        {...props}
        zoomImg={{
          alt: alt,
          src: src,
        }}
        ZoomContent={(data) => CustomZoomContent({ ...data, alt, caption })}
      >
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          className="h-full w-full object-cover"
        />
      </Zoom>
    </div>
  )
}

const CustomZoomContent = ({
  buttonUnzoom,
  modalState,
  img,
  alt,
  caption,
  //onUnzooom, // Not used here, but could be
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  const imgProps = img?.props
  const imgWidth = imgProps?.width
  const imgHeight = imgProps?.height

  const classCaption = useMemo(() => {
    const hasWidthHeight = imgWidth && imgHeight
    const imgRatioLargerThanWindow =
      imgWidth / imgHeight > window.innerWidth / window.innerHeight

    return clsx({
      'zoom-caption': true,
      'zoom-caption--loaded': isLoaded,
      'zoom-caption--bottom': hasWidthHeight && imgRatioLargerThanWindow,
      'zoom-caption--left': hasWidthHeight && !imgRatioLargerThanWindow,
    })
  }, [imgWidth, imgHeight, isLoaded])

  useLayoutEffect(() => {
    if (modalState === 'LOADED') {
      setIsLoaded(true)
    } else if (modalState === 'UNLOADING') {
      setIsLoaded(false)
    }
  }, [modalState])

  return (
    <>
      {buttonUnzoom}

      <figure>
        {img}
        {alt && caption && (
          <figcaption className={classCaption}>
            {caption}
            {caption != alt && <cite className="zoom-caption-cite">{alt}</cite>}
          </figcaption>
        )}
      </figure>
    </>
  )
}
