import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImageGallery from '@/components/embeds/ImageGallery'
import VideoPlayer from '@/components/embeds/VideoPlayer'
import VideoTeaser from '@/components/embeds/VideoTeaser'

jest.mock(
  'next/dynamic',
  () => () =>
    function Player(props) {
      return (
        <div
          data-testid="player"
          data-url={props.url}
          data-light={props.light ? 'shown' : ''}
        >
          {React.isValidElement(props.light) ? props.light : null}
        </div>
      )
    }
)
jest.mock('react-grid-gallery', () => ({ Gallery: () => <div>Gallery</div> }))
jest.mock('react-medium-image-zoom', () => () => null)
jest.mock('@headlessui/react', () => {
  const Transition = ({ children, show = true }) =>
    show ? <>{children}</> : null
  Transition.Child = ({ children }) => <>{children}</>
  return { Transition }
})

test('gallery cancels a pending resize timer on unmount', () => {
  jest.useFakeTimers()
  const { unmount } = render(<ImageGallery images={[]} />)
  fireEvent(window, new Event('resize'))
  expect(jest.getTimerCount()).toBe(1)
  unmount()
  expect(jest.getTimerCount()).toBe(0)
  jest.useRealTimers()
})

test('play control has an accessible name and starts the video', () => {
  render(
    <VideoPlayer videos={[{ url: 'one', title: 'One', poster: '/one.jpg' }]} />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Video abspielen' }))
  expect(screen.getByTestId('player')).toHaveAttribute('data-light', '')
})

test('playlist exposes native buttons to assistive technology and changes selection', () => {
  render(
    <VideoPlayer
      videos={[
        { url: 'one', title: 'One', poster: '/one.jpg' },
        { url: 'two', title: 'Two', poster: '/two.jpg' },
      ]}
    />
  )
  const secondVideo = screen.getByRole('button', { name: /Two/ })
  expect(secondVideo.closest('[aria-hidden="true"]')).toBeNull()
  fireEvent.click(secondVideo)
  expect(screen.getByTestId('player')).toHaveAttribute('data-url', 'two')
})

test('teaser tolerates an absent portal container', () => {
  expect(() => render(<VideoTeaser />)).not.toThrow()
  expect(screen.queryByTestId('player')).toBeNull()
})

test('teaser mounts into its designated container', () => {
  const target = document.createElement('div')
  target.id = 'video-teaser-container'
  document.body.appendChild(target)
  const { unmount } = render(<VideoTeaser />)
  expect(target.querySelector('[data-testid="player"]')).not.toBeNull()
  unmount()
  target.remove()
})

test('video stills load cropped to their displayed size through the image API', () => {
  const poster = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
  render(
    <VideoPlayer
      videos={[
        { url: 'one', title: 'One', poster: poster('VKxCBFXKZOY') },
        { url: 'two', title: 'Two', poster: poster('BrCz50_iWmM') },
      ]}
    />
  )
  const images = screen
    .getByTestId('player')
    .parentElement.parentElement.querySelectorAll('img')
  expect(images.length).toBeGreaterThanOrEqual(3)
  for (const image of images) {
    // Never YouTube's full 1280px still; always the sized, cropped variant.
    expect(image.getAttribute('src')).toMatch(/^\/api\/assets\/transform\?/)
    expect(image.getAttribute('srcset')).not.toContain('ytimg.com/vi/')
    expect(image.getAttribute('src')).toContain('fit=cover')
  }
  const [still, ...thumbnails] = images
  expect(still.getAttribute('sizes')).toContain('100vw')
  // The selected entry's play icon stays painted above its thumbnail.
  const selected = screen.getByRole('button', { name: /One/ })
  const icon = selected.querySelector('svg')
  expect(
    selected.querySelector('img').compareDocumentPosition(icon) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy()
  for (const thumbnail of thumbnails) {
    expect(thumbnail.getAttribute('sizes')).toBe('64px')
    expect(thumbnail.getAttribute('srcset')).toContain('width=128&height=80')
  }
})
