import React from 'react'
import { render } from '@testing-library/react'
import { Button } from '@/components/Button'
import Hero from '@/components/embeds/Hero'

// Tailwind 4 `outline-hidden` sets --tw-outline-style: none, which
// `focus-visible:outline-2` then reads. A plain `focus:outline-hidden` therefore
// removes the keyboard focus ring; only hide the outline for non-keyboard focus.
function expectVisibleKeyboardOutline(element) {
  const classes = element.className.split(/\s+/)
  expect(classes).not.toContain('focus:outline-hidden')
  expect(classes).toContain('focus-visible:outline-2')
}

it.each([
  ['solid', 'slate'],
  ['solid', 'blue'],
  ['solid', 'white'],
  ['outline', 'slate'],
  ['outline', 'white'],
])('%s/%s Button keeps a keyboard focus outline', (variant, color) => {
  const { getByRole } = render(
    <Button href="/spenden" variant={variant} color={color}>
      Spenden
    </Button>
  )
  expectVisibleKeyboardOutline(getByRole('link'))
})

it('Hero call to action keeps a keyboard focus outline', () => {
  const { getByRole } = render(
    <Hero pages={[]} buttonLabel="Mehr erfahren" buttonUrl="/kontakt" />
  )
  expectVisibleKeyboardOutline(getByRole('link', { name: /Mehr erfahren/ }))
})
