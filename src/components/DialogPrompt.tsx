import { none, option, some } from '@octantis/option'
import EventEmitter from 'events'
import { useEffect } from 'react'
import useOptionState, { SetStateAction } from '../lib/useOptionState'
import Button from './Button'
import Input from './Input'

interface State {
  question: string | JSX.Element
  title: string | null
  answer: string
}

const events = new EventEmitter()

export function DialogPromptProvider() {
  const [state, setState, close] = useOptionState<State>()
  useEffect(() => {
    const handler = (title: string | null, question: string) => {
      setState(s => ({
        title,
        question,
        answer: s.fold('', _ => _.answer),
      }))
    }
    events.on('request', handler)
    return () => {
      events.off('request', handler)
    }
  }, [])
  return state.fold(<></>, state => (
    <div className="modal-dialog">
      <div className="blackout">&nbsp;</div>
      <div className="dialog">
        <h2>{state.title}</h2>
        <p>{state.question}</p>
        <Input
          title="answer"
          onChange={e => setState({ ...state, answer: e.target.value })}
        />
        <div>
          <Button
            onClick={() => {
              events.emit('accept', state.answer)
              close()
            }}
          >
            Accept
          </Button>
          <Button
            onClick={() => {
              events.emit('reject')
              close()
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  ))
}

export default async function prompt(
  question: string,
  title: string | null = null
): Promise<option<string>> {
  events.emit('request', title, question)
  return await new Promise(r => {
    let onReject: () => void
    let onAccept = (answer: string) => {
      events.off('reject', onReject)
      r(some(answer))
    }
    onReject = () => {
      events.off('accept', onAccept)
      r(none())
    }
    events.once('accept', onAccept)
    events.once('reject', onReject)
  })
}
