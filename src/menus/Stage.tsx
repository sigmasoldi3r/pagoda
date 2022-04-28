import EventEmitter from 'events'
import { useEffect, useState } from 'react'
import { useNav } from '../components/Nav'
import * as lib from '../grammar/pagoda'
import { Rom } from '../lib/storage/Rom'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'

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
function clearInstances() {
  instances = 0
  window.removeEventListener('popstate', clearInstances)
}
export default function Stage({ rom }: { rom: Rom }) {
  const nav = useNav()
  const [narration, narrate] = useState<JSX.Element[]>([])
  const [choice, setChoice] = useState<JSX.Element | null>(null)
  const [ended, setEnded] = useState(false)
  const [waiting, setWaiting] = useState(false)
  useEffect(() => {
    if (instances++ > 0) return
    window.addEventListener('popstate', clearInstances)
    lib.Runtime.options.trace = true
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
            narrate(s => [
              ...s,
              <div className="narration-line">
                {
                  <Markdown
                    remarkPlugins={[gfm]}
                    components={{
                      a(props) {
                        return <a {...props} target="_blank" rel="self" />
                      },
                    }}
                  >
                    {text}
                  </Markdown>
                }
              </div>,
            ])
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
          setChoice(null)
          break
      }
      return stmt
    })
    rt.locals.__rand = function random(target: number | any[]) {
      if (typeof target === 'number') {
        return ((Math.random() * target) >> 0) + 1
      } else {
        return target[(Math.random() * target.length) >> 0]
      }
    }
    const result = rom.getScript('init')
    if (result.success()) {
      rt.start(result.value).then(() => {
        setEnded(true)
      })
    } else {
      const text = rom.scripts[rom.meta.entry ?? 'init']
      const err = result.error as any
      narrate(s => [
        ...s,
        <div style={{ color: 'red' }}>
          <h2>Fatal Error</h2>
          <pre>
            {err.format
              ? (result.error as any).format([
                  { source: rom.meta.entry ?? 'init', text },
                ])
              : err.message}
          </pre>
        </div>,
      ])
      setEnded(true)
    }
  }, [])
  function handleTap() {
    if (ended && instances > 0) {
      nav.pop()
    } else if (waiting) {
      events.emit('tap')
    }
  }
  return (
    <div onClick={handleTap} className="stage">
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
