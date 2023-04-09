import type { Template } from 'tinacms'

export const heroBlock: Template = {
  name: 'hero',
  label: 'Hero',
  ui: {
    defaultItem: {
      headline: 'This Big Text is Totally Awesome',
      text: 'Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.',
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Überschrift',
      name: 'headline',
    },
    {
      type: 'rich-text',
      isBody: true,
      label: 'Beschreibung',
      name: 'text',
    },
  ],
}

export const featureBlock: Template = {
  name: 'features',
  label: 'Features',
  fields: [
    {
      type: 'object',
      label: 'Feature Items',
      name: 'items',
      list: true,
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Text',
          name: 'text',
        },
      ],
    },
  ],
}

export const contentBlock: Template = {
  name: 'content',
  label: 'Content',
  ui: {
    defaultItem: {
      body: 'Sit dolor mollit irure.',
    },
  },
  fields: [
    {
      type: 'rich-text',
      ui: {
        component: 'textarea',
      },
      isBody: true,
      label: 'Body',
      name: 'body',
    },
  ],
}
