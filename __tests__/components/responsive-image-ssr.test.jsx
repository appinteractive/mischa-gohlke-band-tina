/** @jest-environment node */
import React from 'react'
import { renderToString } from 'react-dom/server'
import ResponsiveImage from '@/components/embeds/ResponsiveImage'

describe('server-rendered inline images', () => {
  it.each([undefined, 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'])(
    'renders real responsive image markup with blurhash %s',
    (blurDataURL) => {
      const html = renderToString(
        <ResponsiveImage
          url="/media/portrait.jpg"
          alt="Portrait"
          caption="Full portrait"
          blurDataURL={blurDataURL}
        />
      )
      expect(html).toContain('<figure')
      expect(html).toContain('<img')
      expect(html).toContain('srcSet=')
      expect(html).toContain('sizes=')
      expect(html).toContain('height=360')
      expect(html).toContain('object-contain')
      expect(html).not.toContain('fit=cover')
      expect(html).toContain('Full portrait')
      expect(html.includes('<canvas')).toBe(Boolean(blurDataURL))
    }
  )
  it('normalizes Tina URLs without losing image markup or alt text', () => {
    const html = renderToString(
      <ResponsiveImage
        url="/mediahttps://assets.tina.io/client/portrait.jpg"
        alt="Portrait"
      />
    )
    expect(html).toContain('srcSet=')
    expect(html).toContain('src=https%3A%2F%2Fassets.tina.io')
    expect(html).not.toContain('mediahttps')
    expect(html).toContain('alt="Portrait"')
  })
})
