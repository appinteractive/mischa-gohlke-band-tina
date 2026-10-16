import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import Confirm from '@/pages/confirm'
import { useRouter } from 'next/router'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/layouts/default', () => ({
  __esModule: true,
  default: ({ children }) => <main>{children}</main>,
}))
jest.mock('@/lib/nav-model', () => ({ normalizeNavigation: () => ({}) }))
jest.mock('@/tina/__generated__/client', () => ({}))
jest.mock('@/pages/success', () => ({ Success: () => <p>Confirmed</p> }))

const mockRouter = useRouter as jest.Mock
const replace = jest.fn().mockResolvedValue(true)
const request = jest.fn()
const props = { data: { nav: {} } }
let route: { isReady: boolean; asPath: string; replace: typeof replace }

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = request
  route = {
    isReady: true,
    asPath: '/confirm?email=person%2Btag%40example.com&hash=valid',
    replace,
  }
  mockRouter.mockImplementation(() => route)
})

afterEach(() => jest.restoreAllMocks())

it('waits for router hydration and preserves encoded email parameters', async () => {
  route.isReady = false
  request.mockResolvedValue({
    ok: true,
    json: async () => ({ body: { success: true } }),
  })
  const view = render(<Confirm {...props} />)
  expect(request).not.toHaveBeenCalled()
  route.isReady = true
  view.rerender(<Confirm {...props} />)
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/success'))
  const url = new URL(request.mock.calls[0][0], 'https://example.com')
  expect(url.searchParams.get('email')).toBe('person+tag@example.com')
  expect(url.searchParams.get('hash')).toBe('valid')
})

it.each([
  { ok: false, json: async () => ({ body: { success: true } }) },
  { ok: true, json: async () => ({ body: { error: true } }) },
  { ok: true, json: async () => ({}) },
  {
    ok: true,
    json: async () => {
      throw new Error('invalid json')
    },
  },
])(
  'shows failure and never redirects for invalid responses %#',
  async (response) => {
    request.mockResolvedValue(response)
    render(<Confirm {...props} />)
    await screen.findByText('Ups…')
    expect(replace).not.toHaveBeenCalled()
  }
)

it('rejects missing or repeated parameters without requesting confirmation', async () => {
  route.asPath = '/confirm?email=a&email=b&hash=valid'
  render(<Confirm {...props} />)
  await screen.findByText('Ups…')
  expect(request).not.toHaveBeenCalled()
})

it('aborts an old request and ignores its completion after the link changes', async () => {
  let resolveOld: (value: unknown) => void
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      })
  )
  request.mockResolvedValueOnce({ ok: false })
  const view = render(<Confirm {...props} />)
  const oldSignal = request.mock.calls[0][1].signal
  route.asPath = '/confirm?email=new%40example.com&hash=new'
  view.rerender(<Confirm {...props} />)
  await screen.findByText('Ups…')
  expect(oldSignal.aborted).toBe(true)
  await act(async () =>
    resolveOld({ ok: true, json: async () => ({ body: { success: true } }) })
  )
  expect(replace).not.toHaveBeenCalled()
  expect(screen.queryByText('Confirmed')).toBeNull()
})

it('aborts work on unmount and does not navigate from a late completion', async () => {
  let resolveRequest: (value: unknown) => void
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve
      })
  )
  const view = render(<Confirm {...props} />)
  const signal = request.mock.calls[0][1].signal
  view.unmount()
  expect(signal.aborted).toBe(true)
  await act(async () =>
    resolveRequest({
      ok: true,
      json: async () => ({ body: { success: true } }),
    })
  )
  expect(replace).not.toHaveBeenCalled()
})
