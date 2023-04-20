import { useEffect, useState } from 'react'

export default function DonationForm() {
  const [shouldRender, setShouldRender] = useState(false)
  useEffect(() => {
    setShouldRender(true)
  }, [])

  return (
    <div className="h-[2050px] !w-full sm:h-[1800px]">
      {!shouldRender && <p className="p-20">Lade Spendenformular...</p>}
      {shouldRender && (
        <iframe
          src="https://secure.fundraisingbox.com/app/payment?hash=6j98n4k8fqegir0h#https%3A%2F%2Fwww.grenzensindrelativ.de%2Fspenden.html"
          title="Spendenformular"
          className="h-[2050px] !w-full sm:h-[8700px]"
          allow="payment"
          frameBorder={0}
        >
          <div className="h-[2050px] !w-full p-20 sm:h-[1800px]">
            <h2>Spendenformular</h2>
            <p>
              Ihr Browser kann keine iFrames darstellen, bitte nutzen Sie
              folgenden Link:{' '}
              <a href="https://secure.fundraisingbox.com/app/payment?hash=6j98n4k8fqegir0h#https%3A%2F%2Fwww.grenzensindrelativ.de%2Fspenden.html">
                Spendenformular
              </a>
            </p>
          </div>
        </iframe>
      )}
    </div>
  )
}
