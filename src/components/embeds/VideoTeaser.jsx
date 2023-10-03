import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export default function VideoTeaser({ type, hasSubNav, ...props }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isInitial, setIsInitial] = useState(true)
  const [current, setCurrent] = useState(
    props?.videos?.length ? props.videos[0] : null
  )
  const [light, setLight] = useState(
    props?.videos?.length ? props.videos[0].poster : null
  )
  const [isSeeking, setIsSeeking] = useState(false)

  /* const onDone = () => {
    setIsPlaying(false)
  } */
  // update current video when the videos change
  useEffect(() => {
    if (!props?.videos?.length) return
    setCurrent(props.videos[0])
    setLight(props.videos[0].poster ?? null)
  }, [props?.videos])

  return createPortal(
    <div className="relative h-[25rem]">
      <div className="absolute left-0 right-0 top-0 flex h-full max-h-[400px] w-full items-center justify-center bg-black bg-black">
        <div className="flex h-full !w-screen opacity-50">
          <ReactPlayer
            className="teaser-player-wrapper h-full"
            url="/media/video/mgb-teaser-1080p-neu.mp4"
            playing={true}
            playsinline={true}
            loop={true}
            muted={true}
            width="100%"
            height="100%"
          />
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          className="absolute bottom-0 -mt-6 h-6 w-screen transform text-white"
        >
          <defs>
            <pattern
              id="line-id-34451"
              x="0"
              y="0"
              width="588"
              height="27"
              patternUnits="userSpaceOnUse"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M0 10.92l8.095-2.362 12.21-3.166 15.069 4.076 21.505-4.076 8.775 1.127 15.314-1.127 25.057 4.076 15.878-4.076 16.821 2.07 25.241-2.07 20.918 2.07 8.546 3.458 13.016-3.458 13.631-3.871 21.376 4.967 31.246-3.166 18.933 5.528 13.826-1.452 9.663-5.877 11.331 5.877 15.832-4.076 27.681 5.528 24.823-5.528 44.714 5.528 33.739-7.329 29.045 5.877 29.701-4.076L559.242 0l16.605 7.462L588 10.92V27H0z"
              ></path>
            </pattern>
          </defs>{' '}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#line-id-34451)"
          ></rect>
        </svg>
      </div>
    </div>,
    document.getElementById('video-teaser-container')
  )
}
