# Salient

Salient is a [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

Use Node.js 24 (see `.nvmrc`) and the Yarn version pinned in `package.json`.
Install dependencies without changing the lockfile:

```bash
nvm install
nvm use
corepack yarn install --immutable
```

Next, run the development server:

```bash
corepack yarn dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Vercel runtime

`engines.node` pins Vercel builds and functions to Node.js 24, overriding the
dashboard setting. This avoids the [Node.js 20 deprecation on October 1, 2026](https://vercel.com/changelog/node-js-20-is-being-deprecated).

Validate with `corepack yarn test --runInBand` and `corepack yarn build`.
The build connects to Tina Cloud and needs access to the configured content branch.
Vercel uses Corepack for the pinned Yarn version and logs `node --version`
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
