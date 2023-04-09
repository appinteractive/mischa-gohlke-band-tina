export const uiUseTitle =
  (field: string = 'title') =>
  (item: any) => ({
    label: item.title,
  })

export const cleanPath = (path: string = '') => {
  // replace ^content/pages/ and .mdx$
  if (path?.trim() === '') return ''
  try {
    return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
  } catch {
    return ''
  }
}

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

export const isImage = (url?: string): boolean => {
  if (!url || url.length < 3) return false
  return !!/\.(gif|jpe?g|png|webp|bmp)$/i.test(url)
}
