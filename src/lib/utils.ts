export const uiUseTitle =
  (field: string = 'title') =>
  (item: any) => ({
    label: item.title,
  })

export const cleanPath = (path: string) => {
  // replace ^content/pages/ and .mdx$
  return path.replace(/^content\/pages/, '').replace(/\.mdx$/, '')
}
