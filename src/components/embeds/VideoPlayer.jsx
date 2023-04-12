import dynamic from 'next/dynamic'
import { useState, useEffect, Fragment, Suspense } from 'react'
import VideoPlayerList from './VideoPlayerList'
import { classNames } from 'tinacms'
import { Transition } from '@headlessui/react'
import { PlayCircleIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

// TODO: Add support and layout for multiple videos

export default function VideoPlayer({ type, hasSubNav, ...props }) {
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

  return (
    <div
      className={clsx(
        'not-prose relative max-w-7xl rounded-lg border bg-black',
        hasSubNav ? 'lg:-mr-[8vw]' : 'lg:-mx-[10vw]'
      )}
    >
      <div className="aspect-h-9 aspect-w-16 w-full">
        {current?.url && (
          <ReactPlayer
            className="h-full w-full overflow-hidden rounded-lg bg-black"
            url={current.url}
            light={light}
            playing={isPlaying}
            onPause={async () => {
              // wait for 100 milliseconds to see if the video is seeking
              // if it is, don't pause the video
              // if it isn't, pause the video
              await new Promise((resolve) => setTimeout(resolve, 100))
              if (!isSeeking) {
                setIsPlaying(false)
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onEnded={() => setIsPlaying(false)}
            onStart={() => {
              setIsInitial(false)
              setIsPlaying(true)
            }}
            onSeek={() => setIsSeeking(true)}
            onReady={() => setIsPlaying(true)}
            onBuffer={() => setIsPlaying(true)}
            controls={true}
            height="100%"
            width="100%"
            playIcon={<span className="hidden" />}
          />
        )}
        <Transition show={!isPlaying || isInitial} as={Fragment}>
          <Transition.Child
            as={Fragment}
            enter="transition duration-[200ms]"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform duration-200 transition ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-lg backdrop-blur-sm"
              onClick={() => {
                setTimeout(() => {
                  setLight(null)
                  setIsPlaying(true)
                }, 100)
              }}
            >
              <VideoPlayButton className="h-full w-full" />
            </div>
          </Transition.Child>
        </Transition>

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {/* <div
            className={classNames(
              'duration-250 absolute inset-0 overflow-hidden rounded-lg bg-black/50 transition-all ease-in-out',
              isPlaying || isInitial
                ? 'opacity-0 backdrop-blur-0'
                : 'opacity-100 backdrop-blur-sm',
              isInitial || isPlaying
                ? 'pointer-events-none'
                : 'pointer-events-auto'
            )}
          ></div> */}
          {props?.videos?.length > 1 && (
            <Transition
              show={!isPlaying || isInitial}
              as={Fragment}
              unmount={false}
            >
              <Transition.Child
                as={Fragment}
                unmount={false}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="pointer-events-auto absolute left-auto right-0 top-0 h-full overflow-y-auto rounded-r-md bg-slate-200 shadow-lg sm:w-[300px]">
                  <div className="border-b border-slate-300 px-3 pb-3 pt-4">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Playlist{' '}
                      <span className="text-xs font-normal text-slate-500">
                        {props.videos.length} videos
                      </span>
                    </h3>
                  </div>
                  <ul
                    role="list"
                    className="flex-1 divide-y divide-slate-300 overflow-y-auto overflow-x-hidden border-b border-slate-300"
                  >
                    {...props?.videos.map((video, index) => (
                      <li
                        key={index}
                        className={classNames(
                          'cursor-pointer select-none ',
                          current?.url === video.url
                            ? 'bg-slate-50'
                            : 'hover:bg-slate-100/50'
                        )}
                        onClick={() => {
                          setCurrent(video)
                          setTimeout(() => {
                            setLight(null)
                            setIsPlaying(true)
                          }, 100)
                        }}
                      >
                        <div className="group relative flex items-center px-3 py-2 pr-4">
                          <div className="-m-1 block flex-1 p-1">
                            <div className="flex min-w-0 flex-1 items-start space-x-2">
                              <div className="relative m-0 inline-block h-10 w-16 flex-shrink-0 overflow-hidden rounded-sm p-0">
                                {current?.url === video.url && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                    <PlayCircleIcon className="h-6 w-6 text-white" />
                                  </div>
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  className="h-full w-full object-cover"
                                  src={video.poster}
                                  alt={video.title}
                                  draggable={false}
                                />
                                {/* <span
                                    className={classNames(
                                      person.status === 'online'
                                        ? 'bg-green-400'
                                        : 'bg-gray-300',
                                      'absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                                    )}
                                    aria-hidden="true"
                                  /> */}
                              </div>
                              <div>
                                <p className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900">
                                  {video.title}
                                </p>
                                <p className="pt-1 text-right text-xs text-gray-500">
                                  {video.duration}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Transition.Child>
            </Transition>
          )}
        </div>
      </div>
    </div>
  )
}

export const VideoPlayButton = () => {
  return (
    <button
      className="group relative flex h-full w-full items-center justify-center bg-black/60 bg-center transition-all duration-75 ease-in-out hover:bg-black/70"
      type="button"
    >
      <span className="flex items-center justify-center drop-shadow-lg transition-all duration-75 ease-in-out group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="absolute z-10 h-12 w-12"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="12" fill="#ffffff" />
        </svg>
        <svg
          className="z-10 h-20 w-20 text-red-800 group-hover:h-24 group-hover:w-24"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            fill="currentColor"
            d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
          ></path>
        </svg>
      </span>
    </button>
  )
}
