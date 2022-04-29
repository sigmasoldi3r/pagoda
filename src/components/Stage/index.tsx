import EventEmitter from 'events'
import { useEffect, useState } from 'react'
import * as lib from '../../grammar/pagoda'
import { Rom } from '../../lib/storage/Rom'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'
import { useNavigate } from 'react-router-dom'
import ChoiceMenu from './ChoiceMenu'

const events = new EventEmitter()

export default function Stage({ rom }: { rom: Rom }) {
  const navigate = useNavigate()
  const [narration, narrate] = useState<JSX.Element[]>([])
  const [choice, setChoice] = useState<JSX.Element | null>(null)
  const [ended, setEnded] = useState(false)
  const [waiting, setWaiting] = useState(false)
  useEffect(() => {
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
                key={`__choices_${Date.now()}`}
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
    const result = rom.getScript('init')
    if (result.success()) {
      rt.start(result.value).then(() => {
        setEnded(true)
      })
    } else {
      const text = rom.scripts[rom.meta.entry ?? 'init']
      const err = result.error as any
      console.error(err, rom)
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
    if (ended) {
      navigate(`/rom/${rom.localID}`)
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
