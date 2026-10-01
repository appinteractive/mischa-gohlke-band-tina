import { waitFor } from '@testing-library/react'
import { VideoPlayerTemplate } from '../../tina/embeds/video-player'

jest.mock('tinacms', () => ({ wrapFieldsWithMeta: (component) => component }))
jest.mock('../../tina/components/PreviewImage', () => () => null)

const validate = VideoPlayerTemplate.fields[0].fields[0].ui.validate
const request = jest.fn()
const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
let video, values, meta
beforeEach(() => {
  request.mockReset()
  global.fetch = request
  video = { url, title: 'Custom title', poster: '/saved.jpg', duration: '1:00' }
  values = { videos: [video] }
  meta = { validating: false, blur: jest.fn() }
})

it.each([
  { ok: false, json: async () => ({}) },
  { ok: true, json: async () => ({}) },
  {
    ok: true,
    json: async () => {
      throw new Error('malformed')
    },
  },
])(
  'keeps saved fields and clears pending validation on bad responses %#',
  async (response) => {
    request.mockResolvedValue(response)
    validate(url, values, meta, { name: 'videos.0.url' })
    await waitFor(() => expect(meta.blur).toHaveBeenCalled())
    expect(meta.validating).toBe(false)
    expect(video).toEqual({
      url,
      title: 'Custom title',
      poster: '/saved.jpg',
      duration: '1:00',
    })
  }
)

it('handles a network rejection without leaving validation pending', async () => {
  request.mockRejectedValue(new Error('offline'))
  validate(url, values, meta, { name: 'videos.0.url' })
  await waitFor(() => expect(meta.blur).toHaveBeenCalled())
  expect(meta.validating).toBe(false)
  expect(video.poster).toBe('/saved.jpg')
})

it('updates metadata while preserving a supplied title', async () => {
  request.mockResolvedValue({
    ok: true,
    json: async () => ({
      thumbnailUrl: '/new.jpg',
      duration: '3:00',
      title: 'Fetched title',
    }),
  })
  validate(url, values, meta, { name: 'videos.0.url' })
  await waitFor(() => expect(meta.blur).toHaveBeenCalled())
  expect(video).toEqual({
    url,
    title: 'Custom title',
    poster: '/new.jpg',
    duration: '3:00',
  })
})

it('ignores a response when its playlist row has been replaced', async () => {
  let finish: (value: unknown) => void
  request.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  validate(url, values, meta, { name: 'videos.0.url' })
  values.videos[0] = {
    ...video,
    url: 'https://www.youtube.com/watch?v=abcdefghijk',
  }
  finish({
    ok: true,
    json: async () => ({
      thumbnailUrl: '/wrong.jpg',
      duration: '3:00',
      title: 'Wrong title',
    }),
  })
  await waitFor(() => expect(meta.blur).toHaveBeenCalled())
  expect(values.videos[0].poster).toBe('/saved.jpg')
})

it.each([{}, { videos: [] }])(
  'ignores incomplete form state without a request',
  (values) => {
    expect(() =>
      validate(url, values, meta, { name: 'videos.0.url' })
    ).not.toThrow()
    expect(request).not.toHaveBeenCalled()
    expect(meta.validating).toBe(false)
  }
)
