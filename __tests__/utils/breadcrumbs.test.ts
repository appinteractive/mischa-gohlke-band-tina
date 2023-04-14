import { NavNode, getSubNavigation } from '@/lib/breadcrumb'
import { describe, it, expect, test } from '@jest/globals'

const nestedTree: NavNode[] = [
  {
    title: '1',
    url: '/',
    children: [
      {
        title: '1.1',
        url: '/1/1',
        children: [
          {
            title: '1.1.1',
            url: '/1/1/1',
          },
          {
            title: '1.1.2',
            url: '/1/1/2',
          },
        ],
      },
      {
        title: '1.2',
        url: '/1/2',
        children: [
          {
            title: '1.2.1',
            url: '/1/2/1',
            children: [
              {
                title: '1.2.1.1',
                url: '/1/2/1/1',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: '2',
    url: '/2',
    children: [
      {
        title: '2.1',
        url: '/2/1',
      },
    ],
  },
]

describe('Testing Sub Navigation', () => {
  it('Parent should be correct', () => {
    // TODO: add tests for getSubNavigation
    /* const nav = getSubNavigation(nestedTree, '/1/2/1/1')
    expect(nav.items[0].title).toBe('1.2.1.1')
    expect(nav.parent.title).toBe('1.2.1') */
    /* const nav2 = getSubNavigation(nestedTree, '/2/1')
    expect(nav2.items[0].title).toBe('1.2')
    expect(nav.parent.title).toBe('2') */
  })
})
