import { events, getKey } from '.'
import Button from '../Button'

/** Spawns an alert, solves when closed. */
export default function alert(content: JSX.Element | string): Promise<void> {
  return new Promise(r => {
    const key = getKey()
    function done() {
      events.emit('close', key)
      r()
    }
    events.emit(
      'push',
      <div key={key} className="dialog">
        <div className="dialog-content">{content}</div>
        <div className="dialog-footer">
          <Button size="small" onClick={done}>
            Dismiss
          </Button>
        </div>
      </div>
    )
  })
}
