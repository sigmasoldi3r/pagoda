import { useEffect, useState } from 'react'
import Console, { useConsole } from '../components/Console'
import { parse } from '../grammar/pagoda.peg'
import * as lib from '../grammar/pagoda'
import { trying } from '../lib/Result'

const sleep = (n: number) => new Promise(r => setTimeout(r, n))

const loadProgram = (src: string) =>
  trying(() => {
    return parse<lib.Program>(src)
  })

let running = false

interface ChoiceProps {
  done: () => void
  options: [lib.ChoiceCase, string][]
  rt: lib.Runtime
  def: lib.Choice
  title: string
}

let last = false
function ChoiceMenu({ done, title, rt, options }: ChoiceProps) {
  const [solved, setSolved] = useState(last)
  console.log(solved, last)
  useEffect(() => {
    if (solved) {
      last = true
    }
  }, [solved])
  return (
    <div style={{ display: 'flex', flexFlow: 'column' }}>
      <h2>{title}</h2>
      {options.map(([opt, label], i) => {
        if (solved) {
          return (
            <button key={`${title}_ch_${i}`} className="choice disabled">
              {label}
            </button>
          )
        }
        return (
          <button
            key={`${title}_ch_${i}`}
            onClick={async () => {
              setSolved(true)
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

export default function Stage({ rom }: { rom: string }) {
  const log = useConsole()
  const rt = new lib.Runtime(async function (stmt) {
    switch (stmt.type) {
      case 'dialogue':
        {
          const actor = await this.getActor(stmt)
          log.println(
            <span style={{ color: '#' + actor.color.toString(16) }}>
              {actor.name}: {await this.getText(stmt)}
            </span>
          )
        }
        break
      case 'narration':
        log.println(await this.getText(stmt))
        break
      case 'choice':
        await new Promise<void>(async done => {
          const title = await this.solve(stmt.title)
          const options: [lib.ChoiceCase, any][] = []
          for (const opt of stmt.options) {
            options.push([opt, await this.solve(opt.match)])
          }
          log.println(
            <ChoiceMenu
              title={title}
              def={stmt}
              rt={this}
              options={options}
              done={done}
            />
          )
        })
        break
    }
    return stmt
  })
  async function loadRom() {
    if (running) return
    running = true
    log.clear()
    log.println('Loading rom...')
    const result = loadProgram(rom)
    if (result.success()) {
      log.println('Done!')
      rt.start(result.value)
    } else {
      log.println(
        <div style={{ color: 'red' }}>
          <h4>Can't load this rom:</h4>
          <p>
            {(result.error as any).format?.([{ text: rom }]) ??
              result.error.toString()}
          </p>
        </div>
      )
    }
  }
  useEffect(() => {
    loadRom()
  }, [])
  return (
    <div>
      <Console context={log} />
    </div>
  )
}
