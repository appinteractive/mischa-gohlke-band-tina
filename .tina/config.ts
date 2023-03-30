import { defineConfig } from 'tinacms'
import { heroBlock, featureBlock, contentBlock } from './blocks/blocks'

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'

export default defineConfig({
  branch,
  clientId: 'f65d1093-c8ef-4ac8-b5b5-8feed1b1e53a', // Get this from tina.io
  token: 'bfee0879e798e52b832908f9978997ccb67f4fc7', // Get this from tina.io
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'media',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Seiten',
        path: 'content/pages',
        format: 'mdx',
        templates: [
          {
            name: 'simple',
            label: 'Einfach',
            fields: [
              {
                type: 'string',
                name: 'title',
                label: 'Titel',
                isTitle: true,
                required: true,
              },
              {
                type: 'string',
                name: 'description',
                label: 'Beschreibung',
              },
              {
                type: 'rich-text',
                name: 'body',
                label: 'Inhalt',
                isBody: true,
                /* templates: [
                  {
                    name: 'img',
                    label: 'Image',
                    fields: [
                      {
                        name: 'children',
                        label: 'CTA',
                        type: 'rich-text',
                      },
                      {
                        name: 'buttonText',
                        label: 'Button Text',
                        type: 'string',
                      },
                    ],
                  },
                ], */
              },
            ],
          },
          {
            name: 'blocks',
            label: 'Blöcke',
            fields: [
              {
                type: 'string',
                name: 'title',
                label: 'Titel',
                isTitle: true,
                required: true,
              },
              {
                type: 'string',
                name: 'description',
                label: 'Beschreibung',
              },
              {
                type: 'object',
                list: true,
                name: 'blocks',
                label: 'Sections',
                ui: {
                  visualSelector: true,
                },
                templates: [heroBlock, featureBlock, contentBlock],
              },
            ],
          },
        ],
        ui: {
          router: ({ document }) => `/${document._sys.breadcrumbs.join('/')}`,
        },
      },
    ],
  },
})
