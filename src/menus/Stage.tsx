import { useEffect, useState } from 'react'
import { useScreen } from '../components/Screen'
import * as lib from '../grammar/pagoda'
import { Rom } from '../lib/storage/Rom'
import LoadRom from './LoadRom'

interface ChoiceProps {
  done: () => void
  options: [lib.ChoiceCase, string][]
  rt: lib.Runtime
  def: lib.Choice
  title: string
}

let last = false
function ChoiceMenu({ done, title, rt, options }: ChoiceProps) {
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
            onClick={async () => {
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

let once = false
export default function Stage({ rom }: { rom: Rom }) {
  const goTo = useScreen()
  const [narration, narrate] = useState<JSX.Element[]>([])
  const [choice, setChoice] = useState<JSX.Element | null>(null)
  const [ended, setEnded] = useState(false)
  useEffect(() => {
    if (once) return
    once = true
    const rt = new lib.Runtime(async function (stmt) {
      switch (stmt.type) {
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
                title={title}
                def={stmt}
                rt={this}
                options={options}
                done={done}
              />
            )
          })
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
    }
  }, [])
  function handleTap() {
    if (ended) {
      once = false
      goTo(<LoadRom />)
    }
  }
  return (
    <div onClick={handleTap} style={{ minHeight: '100%' }}>
      {narration.map((n, i) => (
        <div key={`__narration-${i}`}>{n}</div>
      ))}
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
