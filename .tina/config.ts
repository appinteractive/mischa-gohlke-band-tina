import { Field, defineConfig } from 'tinacms'
import { heroBlock, featureBlock, contentBlock } from './blocks/blocks'
import { footer } from './collections/nav-footer'
import { main } from './collections/nav-main'
import { VideoPlayerTemplate } from './embeds/video-player'

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'

const menuItem = {
  title: {
    type: 'string',
    name: 'title',
    label: 'Titel',
    description: 'Titel der Seite (erscheint im Browser-Tab)',
    isTitle: true,
    required: true,
  },
  description: {
    type: 'string',
    name: 'description',
    label: 'Beschreibung',
    description: 'Kurze Beschreibung für Suchmaschinen',
    ui: {
      component: 'textarea',
    },
    // required: true,
  },
  teaser: {
    type: 'image',
    name: 'teaser',
    label: 'Beitragsbild',
    description: 'Bild für Teaser und Social Media',
  },
  alias: {
    type: 'string',
    name: 'alias',
    label: 'Alte URL',
    description: 'Umleitung von alter URL, beginnend mit Slash: /aktuelles/…',
  },
  accessible: {
    type: 'string',
    name: 'accessible',
    label: 'Leichte Sprache',
    description: 'URL der Seite in leichter Sprach, beginnend mit Slash',
  },
} as any

export default defineConfig({
  branch,
  clientId: 'fada5bbf-afba-44c3-9820-739cae10698c', // Get this from tina.io
  token: '1aa7f4492f69a341d7bf6560b3147e48f5204cb4', // Get this from tina.io
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
              menuItem.title,
              menuItem.description,
              menuItem.teaser,
              menuItem.alias,
              menuItem.accessible,
              {
                type: 'rich-text',
                name: 'body',
                label: 'Inhalt',
                isBody: true,
                templates: [VideoPlayerTemplate],
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
              menuItem.title,
              menuItem.description,
              menuItem.teaser,
              menuItem.alias,
              menuItem.accessible,
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
          router: ({ document }) => {
            return `/${document._sys.breadcrumbs.join('/')}`
          },
        },
      },
      /* {
        name: 'navigation',
        label: 'Navigation',
        path: 'config/navigation',
        format: 'json',
        templates: [footer, main],
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
      }, */
      {
        name: 'navMain',
        label: 'Hauptnavigation',
        path: 'config/navigation',
        format: 'json',
        templates: [main],
        match: {
          include: 'main',
        },
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
      },
      {
        name: 'navFooter',
        label: 'Footer',
        path: 'config/navigation',
        format: 'json',
        templates: [footer],
        match: {
          include: 'footer',
        },
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
      },
    ],
  },
})
