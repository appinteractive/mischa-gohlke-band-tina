module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Tailwind 4 emits oklch() theme colours only. Add sRGB fallbacks so
    // Chrome/Edge 99–110 (e.g. Windows 7/8.1) keep buttons, text and icons.
    '@csstools/postcss-oklab-function': { preserve: true },
    'postcss-focus-visible': {
      replaceWith: '[data-focus-visible-added]',
    },
  },
}
