function accessibleDeepLink(link) {
  const baseLink =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002'
      : 'https://leicht.grenzensindrelativ.de'

  if (!link?.startsWith('http')) {
    link = `${baseLink}${link ?? '/'}`
  }

  return link
}

export default function AccessibilityToggle({ link }) {
  return (
    <nav className="fixed right-0 top-[20rem] z-50 sm:top-[10rem]">
      <a
        href={accessibleDeepLink(link)}
        className="
          sn:pr-6
          flex
          flex-col
          items-center
          justify-center rounded-l-xl
          border
          bg-white
          p-2
          pr-4
          shadow-sm
          sm:p-4
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="flex pt-2 text-center text-xs leading-tight sm:text-sm">
          Leichte
          <br />
          Sprache
        </span>
      </a>
    </nav>
  )
}
