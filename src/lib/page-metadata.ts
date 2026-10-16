export const SITE_TITLE = 'Mischa Gohlke Band'
export const DEFAULT_DESCRIPTION =
  'Mischa Gohlke Band: Musik, Konzerte und Projekte von Mischa Gohlke und seiner Band.'

export function pageRobots(isPlaceholder?: boolean | null, isPreview = false) {
  if (isPreview) return 'noindex, nofollow'
  return isPlaceholder === true ? 'noindex, follow' : 'index, follow'
}

export function pageMetadata(
  title?: string | null,
  description?: string | null
) {
  const pageTitle = title?.trim() || SITE_TITLE
  return {
    title:
      pageTitle === SITE_TITLE ? SITE_TITLE : `${pageTitle} | ${SITE_TITLE}`,
    description: description?.trim() || DEFAULT_DESCRIPTION,
  }
}
