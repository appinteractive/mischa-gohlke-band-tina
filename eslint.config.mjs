import { FlatCompat } from '@eslint/eslintrc'
import { plugin as shadcn } from '@shadcn/lint'
import { defineConfig } from 'eslint/config'
import { fileURLToPath } from 'node:url'

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
})

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'public/admin/**',
      'tina/__generated__/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: { shadcn },
    rules: {
      // Validate utilities against this site's Tailwind theme and plugins.
      'shadcn/no-unknown-classes': [
        'error',
        {
          // Typography excludes this marker via selectors; it emits no utility.
          allow: ['not-prose'],
        },
      ],
      'shadcn/require-static-classes': [
        'warn',
        { componentImports: ['^@/components/Button$'] },
      ],
      'shadcn/no-restyle': [
        'warn',
        {
          componentImports: ['^@/components/Button$'],
          allow: ['layout'],
          message:
            'Button owns its appearance. Use its variant/color props, or change src/components/Button.jsx for a deliberate shared design change. Use className for layout.',
        },
      ],
    },
  },
  {
    files: ['src/components/Button.jsx'],
    rules: { 'shadcn/no-restyle': 'off' },
  },
])
