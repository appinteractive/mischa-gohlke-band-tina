import Link from 'next/link'

export default function Team({ items }) {
  return (
    <div className="pb-12">
      <div>
        {items?.map((area) => (
          <div key={area.title}>
            <h3 className="pt-6 sm:!-mb-4">{area.title}</h3>
            <div
              className="
              grid-cols-2 space-y-6 md:grid md:gap-x-8 lg:space-y-0 
            "
            >
              {area.children.map((person) => (
                <Link
                  href={person.url}
                  className="!m-0 !p-0 !no-underline"
                  key={person.name}
                >
                  <div
                    className="
                    group
                    mb-10 space-y-4
                    sm:grid sm:grid-cols-3 sm:items-start
                    sm:gap-6
                    md:mb-0
                    md:space-y-0 md:px-0
                  "
                  >
                    <div className="aspect-h-2 aspect-w-3 sm:aspect-h-4 sm:aspect-w-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="rounded object-cover shadow-md"
                        src={person.teaser}
                        alt={person.title}
                      />
                    </div>
                    <div className="pt-6 sm:col-span-2 sm:pt-0 md:pt-2">
                      <div className="space-y-4">
                        <div>
                          <h4 className="!leading-tight group-hover:!underline">
                            {person.title}
                          </h4>
                        </div>
                        <div className="text-lg">
                          <p
                            className="
                            line-clamp-3
                            text-base
                            font-normal
                            leading-snug
                            text-gray-800
                          "
                          >
                            {person.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
