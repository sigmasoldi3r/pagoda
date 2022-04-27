import { Key, useEffect, useState } from 'react'
import eventManager from '../../lib/EventManager'

export * from './Prompt'

export const events = eventManager<{
  close: (key: Key) => void
  push: (content: JSX.Element) => void
}>()

export function getKey(): Key {
  return `__dialog:${Date.now()}:${Math.trunc(Math.random() * 100000)}`
}

/**
 * Provider component for dialog context.
 */
export default function DialogProvider() {
  const [stack, updateStack] = useState<[Key, JSX.Element][]>([])
  function push(content: JSX.Element) {
    const key = content.key
    if (key == null) {
      throw new Error('Dialog key must be unique! Use getKey()')
    }
    if (stack.findIndex(([k]) => k === key) > -1) {
      throw new Error(`Dialog keys must be unique! Use getKey()`)
    }
    updateStack(s => [...s, [key, content]])
  }
  function close(key: Key) {
    updateStack(s => s.filter(([k]) => k !== key))
  }
  useEffect(() => {
    events.on('push', push)
    events.on('close', close)
    return () => {
      events.off('push', push)
      events.off('close', close)
    }
  }, [])
  if (stack.length === 0) {
    return null
  }
  return (
    <div style={{ zIndex: 100 }}>
      {stack.map(([key, content]) => (
        <div className="modal-dialog" key={key}>
          <div className="blackout">&nbsp;</div>
          <div style={{ zIndex: 20 }}>
            <div className="dialog">{content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
