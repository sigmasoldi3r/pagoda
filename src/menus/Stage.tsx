import EventEmitter from 'events'
import { useEffect, useState } from 'react'
import { useScreen } from '../components/Screen'
import * as lib from '../grammar/pagoda'
import { Rom } from '../lib/storage/Rom'
import MainMenu from './MainMenu'

interface ChoiceProps {
  done: () => void
  options: [lib.ChoiceCase, string][]
  rt: lib.Runtime
  def: lib.Choice
  title: string
}

function ChoiceMenu({ done, title, rt, options }: ChoiceProps) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return null
  }
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        border: '1px solid gray',
        margin: '1rem',
        padding: '1rem',
      }}
    >
      <h3>{title}</h3>
      {options.map(([opt, label], i) => {
        return (
          <button
            key={`${title}_ch_${i}`}
            onClick={async e => {
              setOpen(false)
              e.stopPropagation()
              e.preventDefault()
              await rt.start(opt.then)
              done()
            }}
            className="choice"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

const events = new EventEmitter()

let choices = 0
let instances = 0
export default function Stage({ rom }: { rom: Rom }) {
  const goTo = useScreen()
  const [narration, narrate] = useState<JSX.Element[]>([])
  const [choice, setChoice] = useState<JSX.Element | null>(null)
  const [ended, setEnded] = useState(false)
  const [waiting, setWaiting] = useState(false)
  useEffect(() => {
    if (instances++ > 0) return
    const rt = new lib.Runtime(async function (stmt) {
      switch (stmt.type) {
        case 'clear':
          narrate(s => [])
          break
        case 'wait':
          setWaiting(true)
          await new Promise(r => events.once('tap', r))
          setWaiting(false)
          break
        case 'dialogue':
          {
            const actor = await this.getActor(stmt)
            const text = await this.getText(stmt)
            narrate(s => [
              ...s,
              <div
                className="narration-line"
                style={{ color: '#' + actor.color.toString(16) }}
              >
                {actor.name}: {text}
              </div>,
            ])
          }
          break
        case 'narration':
          {
            const text = await this.getText(stmt)
            narrate(s => [...s, <div className="narration-line">{text}</div>])
          }
          break
        case 'choice':
          await new Promise<void>(async done => {
            const title = await this.solve(stmt.title)
            const options: [lib.ChoiceCase, any][] = []
            for (const opt of stmt.options) {
              options.push([opt, await this.solve(opt.match)])
            }
            setChoice(
              <ChoiceMenu
                key={`__choices_${choices++}`}
                title={title}
                def={stmt}
                rt={this}
                options={options}
                done={done}
              />
            )
          })
          console.log('Donnie')
          setChoice(null)
          break
      }
      return stmt
    })
    const result = rom.getScript(rom.entry)
    if (result.success()) {
      rt.start(result.value).then(() => {
        setEnded(true)
      })
    } else {
      const text = rom.scripts[rom.entry]
      narrate(s => [
        ...s,
        <div style={{ color: 'red' }}>
          <h2>Fatal Error</h2>
          <pre>
            {(result.error as any).format([{ source: rom.entry, text }])}
          </pre>
        </div>,
      ])
      setEnded(true)
    }
  }, [])
  function handleTap() {
    if (ended) {
      instances = 0
      goTo(<MainMenu />)
    } else if (waiting) {
      events.emit('tap')
    }
  }
  return (
    <div onClick={handleTap} style={{ minHeight: '100%' }}>
      {narration.map((n, i) => (
        <div key={`__narration-${i}`}>{n}</div>
      ))}
      {waiting ? <div className="pulsating">V</div> : null}
      {choice}
      {ended ? (
        <div style={{ color: 'gray' }}>
          <hr />
          <div>Script ended</div>
          <div>Tap anywhere to exit</div>
        </div>
      ) : null}
    </div>
  )
}
