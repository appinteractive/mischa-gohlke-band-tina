import React from 'react'
import { render } from '@testing-library/react'
import SocialMedia from '@/components/embeds/SocialMedia'

// The visible label is hidden on mobile; it must stay available to assistive
// technology (sr-only), not be removed from the accessibility tree.
it.each(['YouTube', 'Instagram', 'Facebook', 'Twitter'])(
  '%s link has an accessible name',
  (name) => {
    const { getByRole } = render(<SocialMedia />)
    const link = getByRole('link', { name })
    expect(link.querySelector('span').className.split(/\s+/)).not.toContain(
      'hidden'
    )
  }
)
