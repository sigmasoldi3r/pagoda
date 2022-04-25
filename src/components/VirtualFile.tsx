import EventEmitter from 'events'
import { useEffect, useRef, useState } from 'react'

const events = new EventEmitter()

export default function downloadFile(data: Uint8Array | string) {
  events.emit('set-href', 'http://google.es', () => {
    events.emit('click')
  })
}

export function VirtualFileProvider() {
  const [href, setHref] = useState('')
  const ref = useRef<HTMLLinkElement>()
  function click() {
    if (ref.current != null) {
      ref.current.click()
    }
  }
  function doUpdate(ref: string, done: () => void) {
    setHref(() => {
      setTimeout(done)
      return ref
    })
  }
  useEffect(() => {
    events.on('set-href', doUpdate)
    events.on('click', click)
    return () => {
      events.off('click', click)
      events.off('set-href', doUpdate)
    }
  }, [])
  return <a href={href} ref={ref as any} />
}
