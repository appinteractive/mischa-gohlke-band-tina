import React from 'react'
import { useCMS, wrapFieldsWithMeta } from 'tinacms'

export const useVideoInput = wrapFieldsWithMeta(({ field, input, meta }) => {
  const cms = useCMS()
  const [isMounted, setMounted] = React.useState(true)

  return <pre>{JSON.stringify({ field, input, meta }, null, 2)}</pre>
})
