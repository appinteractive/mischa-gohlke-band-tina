import { Head, Html, Main, NextScript } from 'next/document'

export default function Document(props) {
  let pageProps = props.__NEXT_DATA__?.props?.pageProps

  return (
    <Html
      className="h-full scroll-smooth bg-white [font-feature-settings:'ss01'] antialiased"
      lang="de"
    >
      <Head>
        {/* Load the flattened Tailwind build only in browsers without layers. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if(!(\'CSSLayerBlockRule\' in window))document.write(\'<link rel="stylesheet" href="/legacy-styles.css">\')',
          }}
        />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
