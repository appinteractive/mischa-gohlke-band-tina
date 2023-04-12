import { FooterNavItem } from '@/components/Footer'
import { NormalizedNavItem, normalizeUrls } from './breadcrumbs'
import { MainNavItem } from '@/components/Header'

export type Nav = {
  main: {
    menu: MainNavItem[]
  }
  footer: {
    footerMenu: FooterNavItem[]
  }
}
export type NormalizedNav = {
  main: NormalizedNavItem[]
  footer: NormalizedNavItem[]
}

export function normalizeNavigation(nav: Nav): NormalizedNav {
  return {
    main: normalizeUrls([...nav.main.menu] as any),
    footer: normalizeUrls([...nav.footer.footerMenu] as any),
  }
}
