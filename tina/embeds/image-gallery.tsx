const getImageDimensions = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = src
  })
}

export const ImageGalleryTemplate: any = {
  name: 'ImageGallery',
  label: 'Bildergalerie',
  fields: [
    {
      type: 'object',
      name: 'images',
      label: 'Bilder',
      list: true,
      ui: {
        component: 'group-list',
        min: 3,
      },
      itemProps: (item: any) => {
        if (item.alt) {
          return { label: item.alt }
        }
        if (item.caption) {
          return { label: item.caption }
        }
        if (item.src) {
          return { label: item.src.replace('/media', '') }
        }
        return { label: '-' }
      },
      fields: [
        {
          type: 'image',
          name: 'src',
          label: 'Bild',
          ui: {
            validate: (src, allValues, meta, field) => {
              console.log(src)
              // get index of current image
              const index = allValues.images?.findIndex(
                (item) => item.src === src
              )

              // get image dimensions of src
              getImageDimensions(src).then(({ width, height }) => {
                console.log(width, height)
                allValues.images[index].width = width
                allValues.images[index].height = height

                allValues.images = [...allValues.images]
                meta.blur()
              })
            },
          },
        },
        {
          type: 'string',
          name: 'caption',
          label: 'Bildunterschrift',
        },
        {
          type: 'string',
          name: 'alt',
          label: 'Alternativtext',
        },
        {
          type: 'number',
          name: 'width',
          component: () => null,
        },
        {
          type: 'number',
          name: 'height',
          component: () => null,
        },
      ],
    },
  ],
}
