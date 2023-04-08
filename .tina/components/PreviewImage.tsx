import React, { useEffect, useState } from 'react'
import { classNames, wrapFieldsWithMeta } from 'tinacms'

const useImagePreview = ({ field, input, meta }) => {
  // add loading and error state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const isImage = (url: string) => {
    if (!url) return false
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null
  }

  // set error state if validation fails
  useEffect(() => {
    if (!isImage(input.value)) {
      setError(true)
      setLoading(false)
    } else {
      setError(false)
      setLoading(true)
    }
  }, [input.value])

  const onLoaded = () => {
    setError(false)
    setLoading(false)
  }
  const onError = () => {
    setError(true)
    setLoading(false)
  }

  return (
    <>
      <img
        className={classNames(
          'h-auto w-full',
          loading || error ? 'hidden' : ''
        )}
        src={input.value}
        alt="Videovorschau"
        draggable={false}
        onError={onError}
        onLoad={onLoaded}
      />
      {(loading || error) && (
        <div className="aspect-h-9 aspect-w-16 h-full w-full bg-black">
          &nbsp;
        </div>
      )}
    </>
  )
}

export default useImagePreview
