# Salient

Salient is a [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

Use Node.js 24 (see `.nvmrc`) and the pnpm version pinned in `package.json`.
Install dependencies without changing the lockfile:

```bash
nvm install
nvm use
corepack pnpm install --frozen-lockfile
```

Next, run the development server:

```bash
corepack pnpm dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Vercel runtime

`engines.node` pins Vercel builds and functions to Node.js 24, overriding the
dashboard setting. This avoids the [Node.js 20 deprecation on October 1, 2026](https://vercel.com/changelog/node-js-20-is-being-deprecated).

Validate with `corepack pnpm test --runInBand` and `corepack pnpm build`.
`corepack pnpm build:local` generates content locally and keeps the Tina server running during prerendering.
The production build connects to Tina Cloud and needs access to the configured content branch.
Vercel uses Corepack for the pinned pnpm version and logs `node --version`
before building; check that a new deployment reports `v24.x` before promotion.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

## License

This site template is a commercial product and is licensed under the [Tailwind UI license](https://tailwindui.com/license).

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation

## Tina CLI startup patch

The pinned pnpm patch for `@tinacms/cli@3.1.0` waits for the local content
server to listen before connecting its database client. Without that wait,
Tina can hang at "Indexing local files" after a connection-refused race.
Keep the patch with the lockfile; recheck it when upgrading the CLI.

## Image response hardening

The pinned `caravaggio@3.9.0` patch returns generic, non-cacheable errors,
removes identifying outbound User-Agent values, and strips processed-image
metadata after applying EXIF orientation. Recheck the patch when upgrading.
Public image URLs use neutral transform parameters. Legacy URLs remain valid
for cached pages. Original public media files are unchanged; their source
metadata is not removed by the transformation endpoint.
