import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server.node'
import PreviewImage from '../../tina/components/PreviewImage'
import {
  useFilteredOptions,
  useSelected,
} from '../../tina/components/hooks/ReferenceHooks'

const options = [
  { id: 'content/pages/inklusion.mdx', title: 'Inklusion' },
  { id: 'content/pages/rockkonzert.mdx', title: 'Rockkonzert' },
]

function ReferenceSummary({ search, id = options[0].id }) {
  const selected = useSelected(options, id)
  const { filteredOptions, filteredStats } = useFilteredOptions(options, search)
  return (
    <span>{JSON.stringify({ selected, filteredOptions, filteredStats })}</span>
  )
}

test('reference selection and search results are correct on the first render', () => {
  const markup = renderToStaticMarkup(<ReferenceSummary search="Rockkonzert" />)
  expect(markup).toContain('Inklusion')
  expect(markup).toContain('Rockkonzert')
  expect(markup).toContain('&quot;filtered&quot;:1')
  expect(markup).toContain('&quot;isReduced&quot;:true')
  expect(renderToStaticMarkup(<ReferenceSummary search="" />)).toContain(
    '&quot;filtered&quot;:2'
  )
  expect(
    renderToStaticMarkup(<ReferenceSummary search="zzzzzzzz" />)
  ).toContain('&quot;filtered&quot;:0')
})

test('a new image starts hidden until it loads and stale events cannot reveal it', () => {
  const { rerender } = render(<PreviewImage input={{ value: '/first.jpg' }} />)
  const first = screen.getByAltText('Videovorschau')
  expect(first.classList.contains('hidden')).toBe(true)
  fireEvent.load(first)
  expect(first.classList.contains('hidden')).toBe(false)
  rerender(<PreviewImage input={{ value: '/second.webp?version=2' }} />)
  const second = screen.getByAltText('Videovorschau')
  expect(second).not.toBe(first)
  expect(second.classList.contains('hidden')).toBe(true)
  fireEvent.load(first)
  expect(second.classList.contains('hidden')).toBe(true)
  fireEvent.error(second)
  expect(second.classList.contains('hidden')).toBe(true)
  fireEvent.load(second)
  expect(second.classList.contains('hidden')).toBe(false)
  rerender(<PreviewImage input={{ value: '' }} />)
  expect(screen.queryByAltText('Videovorschau')).toBeNull()
})
