import React from 'react'
import { getYoutubeVideoId } from '../../src/lib/utils'
import PreviewImage from '../components/PreviewImage'
import { wrapFieldsWithMeta } from 'tinacms'

const VideoPlayIcon = () => {
  return (
    <div
      className="group relative flex h-full w-full items-center justify-center bg-black/60 bg-center transition-colors duration-75 ease-in-out hover:bg-black/70"
      aria-hidden="true"
    >
      <span className="flex items-center justify-center drop-shadow-lg transition-transform duration-75 ease-in-out group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="absolute z-10 size-12"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="12" fill="#ffffff" />
        </svg>
        <svg
          className="z-10 size-20 text-red-800 group-hover:size-24"
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
    </div>
  )
}

export const VideoPlayerTemplate: any = {
  name: 'VideoPlayer',
  label: 'Video Player',
  fields: [
    {
      type: 'object',
      name: 'videos',
      label: 'Videos',
      list: true,
      description: 'Ein oder mehrere Videos',
      ui: {
        component: 'group-list',
        min: 1,
      },
      itemProps: (item: any) => ({
        label: item.title ?? '-',
      }),
      fields: [
        {
          type: 'string',
          name: 'url',
          label: 'URL',
          required: true,
          ui: {
            parse: (url: string) => {
              // NOTE: add support for other video providers?
              const ytVideoId = getYoutubeVideoId(url)
              if (ytVideoId) {
                return `https://www.youtube-nocookie.com/embed/${ytVideoId}?feature=oembed&autoplay=1&rel=0`
              }
              return url
            },
            validate: (
              value: string,
              allValues: any,
              meta: any,
              field: any
            ) => {
              // console.log('validate', value, allValues, meta, field)
              if (!value) return 'Bitte gebe eine Video URL ein.'

              // NOTE: add support for other video providers?
              const ytVideoId = getYoutubeVideoId(value)
              if (ytVideoId) {
                // field.name can be deeply nested in rich-text embeds
                // e.g. "body.children.3.videos.0.url"
                const parts = field.name.split('.')
                const index = parseInt(parts[parts.length - 2])
                if (isNaN(index)) return

                // navigate allValues to find the videos array
                let videos: any = allValues
                for (const part of parts.slice(0, -2)) {
                  if (videos == null) return
                  const idx = parseInt(part)
                  videos = videos[isNaN(idx) ? part : idx]
                }
                if (!Array.isArray(videos)) return

                const video = videos[index]
                if (!video) return
                meta.validating = true
                fetch(`/api/yt?videoId=${ytVideoId}`)
                  .then(async (response) => {
                    if (!response.ok)
                      throw new Error('Video metadata request failed')
                    const data = await response.json()
                    if (
                      typeof data?.thumbnailUrl !== 'string' ||
                      typeof data?.duration !== 'string' ||
                      typeof data?.title !== 'string'
                    ) {
                      throw new Error('Invalid video metadata')
                    }
                    // Do not apply a response to a removed/reordered or edited video.
                    if (
                      videos[index] !== video ||
                      getYoutubeVideoId(video.url) !== ytVideoId
                    )
                      return

                    video.poster = data.thumbnailUrl
                    video.duration = data.duration
                    if (!video.title) video.title = data.title
                    // trigger re-render by replacing the array reference
                    let parent: any = allValues
                    for (const part of parts.slice(0, -3)) {
                      if (parent == null) return
                      const idx = parseInt(part)
                      parent = parent[isNaN(idx) ? part : idx]
                    }
                    if (parent == null) return
                    parent[parts[parts.length - 3]] = [...videos]
                  })
                  .catch(() => {
                    // The URL remains valid; preserve manually supplied metadata.
                  })
                  .finally(() => {
                    meta.validating = false
                    meta.blur()
                  })
              } else {
                return 'Bitte gebe eine gültige YouTube URL ein.'
              }

              return
            },
          },
        },
        {
          type: 'string',
          name: 'title',
          label: 'Titel',
          description: 'Der Titel des Videos (wird automatisch ermittelt)',
        },
        {
          type: 'string',
          name: 'poster',
          label: 'Vorschau',
          ui: {
            component: wrapFieldsWithMeta((data) => {
              return (
                <div className="relative overflow-hidden rounded-md bg-black">
                  <PreviewImage input={data.input} />
                  <div className="pointer-events-none absolute inset-0 bg-black/50">
                    <VideoPlayIcon />
                  </div>
                </div>
              )
            }),
          },
        },
        {
          type: 'string',
          name: 'duration',
          label: 'Dauer',
          ui: {
            component: () => null,
          },
        },
      ],
    },
  ],
}
