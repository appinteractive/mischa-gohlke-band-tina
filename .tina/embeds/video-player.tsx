import React from 'react'
import { getYoutubeVideoId } from '../../src/lib/utils'
import useImagePreview from '../components/PreviewImage'
import { VideoPlayButton } from '../../src/components/embeds/VideoPlayer'
import { wrapFieldsWithMeta } from 'tinacms'

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
              console.log('validate', value, allValues, meta, field)
              if (!value) return 'Bitte gebe eine Video URL ein.'

              // NOTE: add support for other video providers?
              const ytVideoId = getYoutubeVideoId(value)
              if (ytVideoId) {
                meta.validating = true
                fetch(`/api/yt?videoId=${ytVideoId}`).then(async (response) => {
                  const data: any = await response.json()

                  // get index of field string ('videos.0.url' = 0)
                  const index = parseInt(field.name.split('.')[1])

                  allValues.videos[index].poster = data.thumbnailUrl
                  allValues.videos[index].duration = data.duration

                  // only set title if it's not already set
                  if (!allValues.videos[index].title) {
                    allValues.videos[index].title = data.title
                  }

                  // stop validation and trigger re-render
                  allValues.videos = [...allValues.videos]
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
                  {useImagePreview(data)}
                  <div className="pointer-events-none absolute inset-0 bg-black/50">
                    <VideoPlayButton />
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
