import { Analytics } from '@vercel/analytics/react'
import { Inter, Lexend } from 'next/font/google'
import 'focus-visible'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
})

// Display text is not present on every page; fetch Lexend only when used.
const lexend = Lexend({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --font-lexend: ${lexend.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
