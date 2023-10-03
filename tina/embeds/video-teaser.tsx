import useImagePreview from '../components/PreviewImage'
import { wrapFieldsWithMeta } from 'tinacms'
import { useReferenceSelect } from '../components/ReferenceSelect'
import client from '../__generated__/client'

export const VideoTeaserTemplate: any = {
  name: 'VideoTeaser',
  label: 'Video Teaser',
  fields: [
    {
      type: 'string',
      name: 'url',
      label: 'URL',
      required: true,
    },
  ],
}
