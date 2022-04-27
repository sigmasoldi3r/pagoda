import { none, option, some } from '@octantis/option'
import EventEmitter from 'events'
import { useEffect } from 'react'
import useOptionState from '../lib/useOptionState'
import Button from './Button'
import Input from './Input'

interface State {
  question: string | JSX.Element
  title: string | null
  answer: string
  hiddenInput: boolean
}

const events = new EventEmitter()

/** @deprecated */
export function DialogPromptProvider() {
  const [state, setState, close] = useOptionState<State>()
  useEffect(() => {
    const handler = (
      title: string | null,
      question: string,
      bool?: boolean
    ) => {
      setState(s => ({
        title,
        question,
        answer: s.fold('', _ => _.answer),
        hiddenInput: bool ?? false,
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
        {state.hiddenInput ? (
          <hr className="wide" />
        ) : (
          <Input
            title=""
            onChange={e => setState({ ...state, answer: e.target.value })}
          />
        )}
        <div
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
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

const untilAnswer = () =>
  new Promise<any>(r => {
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

/** @deprecated */
export default async function prompt(
  question: string,
  title: string | null = null
): Promise<option<string>> {
  events.emit('request', title, question)
  return await untilAnswer()
}

/** @deprecated */
prompt.bool = async function promptBool(
  question: string,
  title: string | null = null
): Promise<option<string>> {
  events.emit('request', title, question, true)
  return await untilAnswer()
}
