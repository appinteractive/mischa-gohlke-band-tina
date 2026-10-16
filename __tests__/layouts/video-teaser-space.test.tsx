/** @jest-environment node */
import React from 'react'
import { renderToString } from 'react-dom/server'
import Layout from '@/layouts/default'

jest.mock('@/components/Header', () => ({ Header: () => null }))
jest.mock('@/components/Footer', () => ({ Footer: () => null }))

// The teaser only mounts in the browser, so the server HTML must already hold
// its 400px; otherwise everything below shifts down after hydration (CLS).
it('reserves the teaser height in server HTML on pages with a teaser', () => {
  const html = renderToString(<Layout hasVideoTeaser>content</Layout>)
  const container = html.match(/<div id="video-teaser-container"[^>]*>/)?.[0]
  expect(container).toContain('h-100')
  // #__next is a full-height flex column; without this the empty box shrinks.
  expect(container).toContain('shrink-0')
})

it('reserves no space on pages without a teaser', () => {
  const html = renderToString(<Layout>content</Layout>)
  expect(html).toContain('<div id="video-teaser-container"></div>')
})
