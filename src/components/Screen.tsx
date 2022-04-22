import { useEffect, useState } from 'react'

const updates: React.Dispatch<React.SetStateAction<JSX.Element>>[] = []

export function useScreen() {
  return (element: JSX.Element) => updates.forEach(update => update(element))
}

export default function Screen({ children }: { children: JSX.Element }) {
  const [current, setCurrent] = useState(children)
  useEffect(() => {
    updates.push(setCurrent)
    return () => {
      const idx = updates.findIndex(e => e === setCurrent)
      if (idx > -1) {
        updates.splice(idx, 1)
      }
    }
  }, [])
  return current
}
