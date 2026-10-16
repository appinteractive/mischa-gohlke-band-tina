import React from 'react'
import { render, screen } from '@testing-library/react'
import Hero from '@/components/embeds/Hero'
import ContentGallery from '@/components/embeds/ContentGallery'

const pages = Array.from({ length: 4 }, (_, index) => ({
  page: `content/pages/page-${index}.mdx`,
  title: `Photo ${index}`,
  teaser: `/media/photo-${index}.jpg`,
  description: 'A photograph',
}))

function candidates(image) {
  return image
    .getAttribute('srcset')
    .split(', ')
    .map((candidate) => {
      const [source, descriptor] = candidate.split(' ')
      const url = new URL(source, 'https://local.invalid')
      return {
        width: Number(url.searchParams.get('width')),
        height: Number(url.searchParams.get('height')),
        fit: url.searchParams.get('fit'),
        descriptor: Number(descriptor.slice(0, -1)),
      }
    })
}

it.each([false, true])(
  'Hero retains useful thumbnail candidates with sidebar=%s',
  (hasSubNav) => {
    render(<Hero pages={pages} hasSubNav={hasSubNav} />)
    const thumbnail = candidates(screen.getByAltText('Photo 1'))
    expect(thumbnail.some(({ width }) => width === 96)).toBe(true)
    for (const candidate of thumbnail) {
      expect(candidate.fit).toBe('cover')
      expect(candidate.width).toBe(candidate.descriptor)
      expect(candidate.height).toBe(
        Math.max(1, Math.round((candidate.width * 4) / 5))
      )
    }
    for (const candidate of candidates(screen.getByAltText('Photo 0'))) {
      expect(candidate.height).toBe(Math.round(candidate.width / 2))
    }
  }
)

it.each([false, true])(
  'ContentGallery crops cards and keeps small thumbnails with sidebar=%s',
  (hasSubNav) => {
    render(<ContentGallery pages={pages} hasSubNav={hasSubNav} />)
    const thumbnail = candidates(screen.getByAltText('Photo 3'))
    expect(thumbnail.some(({ width }) => width === 128)).toBe(true)
    for (const candidate of thumbnail) {
      expect(candidate.fit).toBe('cover')
      expect(candidate.width).toBe(candidate.descriptor)
      expect(candidate.height).toBe(
        Math.max(1, Math.round((candidate.width * 5) / 8))
      )
    }
    for (const candidate of candidates(screen.getByAltText('Photo 0'))) {
      expect(candidate.height).toBe(Math.round(candidate.width / 2))
    }
  }
)
