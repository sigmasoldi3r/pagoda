import EventEmitter from 'events'
import { useEffect, useState } from 'react'
import * as lib from '../../grammar/pagoda'
import { Rom } from '../../lib/storage/Rom'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'
import { useNavigate } from 'react-router-dom'
import ChoiceMenu from './ChoiceMenu'
import ErrorFormatter from '../ErrorFormatter'

const events = new EventEmitter()

export function useNarration() {
  const [narration, narrate] = useState<JSX.Element[]>([])
  const [choice, setChoice] = useState<JSX.Element | null>(null)
  const [waiting, setWaiting] = useState(false)
  async function processor(stmt: lib.Statement) {
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
  }
  return [
    narration,
    waiting,
    choice,
    processor,
    narrate,
    setWaiting,
    setChoice,
  ] as const
}

export default function Stage({ rom }: { rom: Rom }) {
  const navigate = useNavigate()
  const [ended, setEnded] = useState(false)
  const [narration, waiting, choice, processor, narrate] = useNarration()
  useEffect(() => {
    const rt = new lib.Runtime(processor)
    const result = rom.getScript('init')
    if (result.success()) {
      rt.start(result.value).then(() => {
        setEnded(true)
      })
    } else {
      const source = rom.meta.entry ?? 'init'
      const text = rom.scripts[source]
      const err = result.error as any
      console.error(err, rom)
      narrate(s => [
        ...s,
        <ErrorFormatter err={err} source={source} text={text} />,
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
