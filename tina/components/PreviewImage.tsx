import React, { useState } from 'react'

function ImagePreview({ src }: { src: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  )

  return (
    <>
      {src && (
        <img
          className={`h-auto w-full${status === 'loaded' ? '' : ' hidden'}`}
          src={src}
          alt="Videovorschau"
          draggable={false}
          onError={() => setStatus('error')}
          onLoad={() => setStatus('loaded')}
        />
      )}
      {status !== 'loaded' && (
        <div className="aspect-h-9 aspect-w-16 h-full w-full bg-black">
          &nbsp;
        </div>
      )}
    </>
  )
}

export default function PreviewImage({ input }: { input: { value?: string } }) {
  const src = input.value ?? ''
  return <ImagePreview key={src} src={src} />
}
