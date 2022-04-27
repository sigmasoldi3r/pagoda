import { ReactNode } from 'react'
import { events, getKey } from '.'

/** Locks the screen until user closes the dialog. */
export default function lock(content: ReactNode) {
  let key = getKey()
  events.emit(
    'push',
    <div key={key} className="dialog">
      {content}
    </div>
  )
  function done() {
    events.emit('close', key)
  }
  function update(content: ReactNode) {
    done()
    const [, , n] = lock(content)
    key = n
  }
  return [done, update, key] as const
}
