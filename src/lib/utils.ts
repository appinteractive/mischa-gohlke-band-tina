import clsx from 'clsx'

type ValidationProps = {
  label: string
  max?: number
  min?: number
  required?: boolean
}

/**
 * handles the validation for the ui
 * including required, min and max length
 *
 * has to be used as the ui.validate method in the schema
 */
export const uiUseValidation =
  (options: ValidationProps) => (value: string) => {
    const val = value?.trim() ?? ''
    const min = options.min
    if (options.required && val === '') {
      return `Bitte ${options.label} eingeben`
    }
    if (min && val.length < min) {
      return `${options.label} muss mindestens ${min} Zeichen lang sein`
    }
    if (options.max && val.length > options.max) {
      return `${options.label} darf nicht länger als ${options.max} Zeichen sein`
    }
  }

/**
 * handles the title field for the ui (e.g. in the list view)
 * including empty title and disabled state
 * also does it style the list item accordingly based on the disabled state
 *
 * has to be used as the ui.itemProps method in the schema
 */
export const uiUseTitle =
  (field: string = 'title'): CallableFunction =>
  (item: any) => {
    const disabled = item.disabled === true
    console.log('item', item)
    return {
      label: `${item.title ?? '>> Titel fehlt <<'}${
        disabled ? ' (ausgeblendet)' : ''
      }`,
      className: clsx(
        'relative group cursor-pointer flex justify-between items-stretch border border-gray-100 -mb-px overflow-visible p-0 text-sm first:rounded-t last:rounded-b',
        disabled
          ? 'disabled-item text-gray-300 bg-gray-50'
          : 'font-normal text-gray-600 bg-white'
      ),
    }
  }

/**
 * removed /content/pages/ and .mdx from the path to get the url
 *
 * TODO: make this more robust by providing a list of collections to remove
 */
export const cleanPath = (path: string = '') => {
  // replace ^content/pages/ and .mdx$
  if (path?.trim() === '') return ''
  try {
    return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
  } catch {
    return ''
  }
}

/**
 * returns the youtube video id from a youtube url or null if it is not a youtube url
 */
export const getYoutubeVideoId = (url: string) => {
  const regexList = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/,
    /^https?:\/\/(?:www\.)?youtu\.be\/([\w-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([\w-]{11})/,
    /^https?:\/\/(?:www\.)?youtube-nocookie\.com\/embed\/([\w-]{11})/,
  ]
  try {
    for (let i = 0; i < regexList.length; i++) {
      const match = url.match(regexList[i])
      if (match) {
        return match[1]
      }
    }
  } catch (e) {}

  return null
}

/**
 * returns true if the url is an image based on the file extension
 */
export const isImage = (url?: string): boolean => {
  if (!url || url.length < 3) return false
  return !!/\.(gif|jpe?g|png|webp|bmp)$/i.test(url)
}

interface HasChildren {
  children?: HasChildren[]
}
