import Link from 'next/link'

export function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-block rounded px-3 py-3 text-sm text-slate-700 outline-offset-2"
    >
      {children}
    </Link>
  )
}
