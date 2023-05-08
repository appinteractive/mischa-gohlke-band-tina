import clsx from 'clsx'
import { useState } from 'react'

export default function NewsletterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const { email } = Object.fromEntries(formData.entries())

    fetch('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: email?.toString()?.trim() }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          setError(true)
          setLoading(false)
        } else {
          setSuccess(true)
          setLoading(false)
        }
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  return (
    <div className="sm:max-w-md">
      <h3 className="text-sm font-semibold leading-6 text-gray-900">
        Anmeldung zum Newsletter
      </h3>
      <p
        className={clsx(
          'mt-2 text-sm leading-5 text-gray-600',
          success && 'opacity-10'
        )}
      >
        Melde dich hier zu unserem Newsletter an, um über aktuelle Events und
        Projekte auf dem laufenden zu bleiben.
      </p>
      <form onSubmit={onSubmit} className="mt-4 w-full sm:flex">
        <label htmlFor="email-address" className="sr-only">
          Deine E-Mail Adresse
        </label>
        <input
          type="email"
          name="email"
          id="email-address"
          autoComplete="email"
          aria-label="E-Mail für Newsletter-Anmeldung"
          required
          className="!w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:opacity-50 sm:w-64 sm:text-sm sm:leading-6"
          placeholder="Deine E-Mail Adresse"
          disabled={loading || success}
        />
        <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
          <button
            disabled={loading || success}
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-400"
          >
            <span className={clsx(loading && 'opacity-0')}>Anmelden</span>
            {loading && (
              <svg
                className="absolute h-5 w-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75" // eslint-disable-next-line
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-4">
          <p className="text-sm font-medium leading-5 text-red-600">
            Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.
          </p>
        </div>
      )}
      {success && (
        <div className="mt-4">
          <p className="text-sm font-medium leading-5 text-gray-600">
            Vielen Dank für deine Anmeldung. Du erhältst in Kürze eine E-Mail
            mit einem Bestätigungslink.
          </p>
        </div>
      )}
    </div>
  )
}
