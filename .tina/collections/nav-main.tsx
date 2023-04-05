import { useReferenceSelect } from '../components/ReferenceSelect'
import { uiUseTitle } from './utils'

const menu: any = {
  type: 'object',
  name: 'children',
  label: 'Unterseiten',
  list: true,
  ui: {
    itemProps: uiUseTitle(),
  },
}

const menuItem = {
  title: {
    type: 'string',
    name: 'title',
    label: 'Titel',
    isTitle: true,
    required: true,
  },
  description: {
    type: 'string',
    name: 'description',
    label: 'Optionale Beschreibung die unter dem Menüpunkt erscheint',
  },
  disabled: {
    type: 'boolean',
    name: 'disabled',
    label: 'Deaktiviert',
  },
  showInMainNavigation: {
    type: 'boolean',
    name: 'showInMainNavigation',
    label: 'Beschreibung',
  },
  page: {
    type: 'reference',
    name: 'page',
    label: 'Seite',
    collections: ['page'],
    ui: {
      component: useReferenceSelect,
    },
  },
}

export const main: any = {
  name: 'mainNav',
  label: 'Hauptnavigation',
  fields: [
    {
      ...menu,
      name: 'menu',
      label: 'Reiter',
      fields: [
        { ...menuItem.title, nameOverride: 'mainTitle1' },
        { ...menuItem.page, nameOverride: 'mainPage1' },
        {
          ...menu,
          nameOverride: 'mainChildren1',
          ui: {
            itemProps: uiUseTitle(),
          },
          fields: [
            {
              ...menuItem.title,
              nameOverride: 'mainTitle2',
            },
            { ...menuItem.page, nameOverride: 'mainPage2' },
            { ...menuItem.disabled, nameOverride: 'mainDisabled2' },
            {
              ...menu,
              nameOverride: 'mainChildren2',
              fields: [
                {
                  ...menuItem.title,
                  nameOverride: 'mainTitle3',
                },
                {
                  ...menuItem.page,
                  nameOverride: 'mainPage3',
                },
                {
                  ...menu,
                  nameOverride: 'mainChildren3',
                  fields: [
                    {
                      ...menuItem.title,
                      nameOverride: 'mainTitle4',
                    },
                    {
                      ...menuItem.page,
                      nameOverride: 'mainPage4',
                    },
                    {
                      ...menu,
                      nameOverride: 'mainChildren4',
                      fields: [
                        {
                          ...menuItem.title,
                          nameOverride: 'mainTitle5',
                        },
                        {
                          ...menuItem.page,
                          nameOverride: 'mainPage5',
                        },
                      ],
                    },
                  ] as any,
                },
              ],
            },
          ],
        },
      ] as any,
    },
  ],
}

// console.log('main', JSON.stringify(main, null, 2))
