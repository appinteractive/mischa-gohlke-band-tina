import useImagePreview from '../components/PreviewImage'
import { wrapFieldsWithMeta } from 'tinacms'
import { useReferenceSelect } from '../components/ReferenceSelect'
import client from '../__generated__/client'

export const ContentGalleryTemplate: any = {
  name: 'ContentGallery',
  label: 'Verwandte Inhalte',
  fields: [
    {
      type: 'object',
      name: 'pages',
      label: 'Seiten',
      list: true,
      description: 'Liste verwendeter Seiten',
      ui: {
        component: 'group-list',
        min: 3,
      },
      itemProps: (item: any) => ({
        label: item.title ?? '-',
      }),
      fields: [
        {
          type: 'reference',
          name: 'page',
          label: 'Seite',
          required: true,
          collections: ['page'],
          ui: {
            component: useReferenceSelect,
            validate: (
              value: string,
              allValues: any,
              meta: any,
              field: any
            ) => {
              if (!value) return 'Bitte wähle eine Seite.'

              console.log({
                value,
                allValues,
                meta,
                field,
              })
              meta.validating = true
              client.queries
                .page({ relativePath: value.replace('content/pages/', '') })
                .then((result) => {
                  const index = parseInt(field.name.split('.')[1])
                  const page = result.data?.page

                  allValues.pages[index].teaser = page.teaser

                  // only set title if it's not already set
                  if (!allValues.pages[index].title) {
                    allValues.pages[index].title = page.title
                  }

                  // only set description if it's not already set
                  if (!allValues.pages[index].description) {
                    allValues.pages[index].description = page.description
                  }

                  // stop validation and trigger re-render
                  allValues.pages = [...allValues.pages]

                  meta.validating = false
                  meta.blur()
                })

              return
            },
          },
        },
        {
          type: 'string',
          name: 'title',
          label: 'Titel',
          description: 'Der Titel (wird automatisch ermittelt)',
        },
        {
          type: 'string',
          name: 'description',
          label: 'Beschreibung',
          description: 'Beschreibung (wird automatisch ermittelt)',
        },
        {
          type: 'string',
          name: 'teaser',
          label: 'Vorschau',
          ui: {
            component: wrapFieldsWithMeta((data) => {
              return (
                <div className="relative overflow-hidden rounded-md bg-black">
                  {useImagePreview(data)}
                </div>
              )
            }),
          },
        },
      ],
    },
  ],
}
