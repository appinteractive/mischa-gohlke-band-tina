// Builds public/legacy-styles.css for browsers without CSS cascade layers
// (Chrome < 99, Safari < 15.4, Firefox < 97). They drop every @layer rule
// in the main stylesheet and would render the site unstyled.
//
// The file is the same Tailwind build with layers flattened into selector
// specificity. It is loaded by _document only when `CSSLayerBlockRule` is
// missing, so modern browsers never download it. That matters: flattening
// lets Tailwind outrank unlayered third-party CSS such as Eye-Able's
// contrast mode, which must keep working for current browsers.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/postcss'
import cascadeLayers from '@csstools/postcss-cascade-layers'
import oklabFunction from '@csstools/postcss-oklab-function'
import postcss from 'postcss'
import focusVisible from 'postcss-focus-visible'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = path.join(root, 'src/styles/tailwind.css')
const output = path.join(root, 'public/legacy-styles.css')

const source = await readFile(entry, 'utf8')
// Unlayered CSS has to be in the same file to keep winning over the
// flattened Tailwind rules; the zoom library is imported separately in the
// app, so add it here after the Tailwind import.
const [firstLine, ...rest] = source.split('\n')
const input = [
  firstLine,
  "@import 'react-medium-image-zoom/dist/styles.css';",
  ...rest,
].join('\n')

const result = await postcss([
  tailwindcss({ optimize: { minify: true } }),
  cascadeLayers(),
  oklabFunction({ preserve: true }),
  focusVisible({ replaceWith: '[data-focus-visible-added]' }),
]).process(input, { from: entry, to: output })

if (/@layer\b/.test(result.css)) {
  throw new Error('legacy-styles.css still contains @layer rules')
}

await writeFile(output, result.css)
console.log(
  `legacy-styles.css: ${(Buffer.byteLength(result.css) / 1024).toFixed(1)} KiB`
)
