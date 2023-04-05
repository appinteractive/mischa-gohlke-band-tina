import { useReferenceSelect } from '../components/ReferenceSelect'
import { uiUseTitle } from './utils'

export const footer: any = {
  name: 'footer',
  label: 'Footer',
  fields: [
    {
      type: 'object',
      name: 'footerMenu',
      nameOverride: 'menu',
      label: 'Reiter',
      list: true,
      ui: {
        itemProps: uiUseTitle(),
      },
      fields: [
        {
          type: 'string',
          name: 'title',
          nameOverride: 'footerTitle',
          label: 'Titel',
          isTitle: true,
          required: true,
        },
        {
          type: 'object',
          list: true,
          name: 'children',
          nameOverride: 'footerChildren',
          label: 'Unterpunkte',
          ui: {
            itemProps: uiUseTitle(),
          },
          fields: [
            {
              type: 'string',
              name: 'title',
              label: 'Titel',
              isTitle: true,
              required: true,
            },
            {
              type: 'reference',
              name: 'page',
              label: 'Seite',
              required: true,
              collections: ['page'],
              ui: {
                component: useReferenceSelect,
              },
            },
          ],
        },
      ],
    },
  ],
}
