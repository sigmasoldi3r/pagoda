import { useEffect } from 'react'
import Console, { useConsole } from '../components/Console'
import { parse } from '../grammar/pagoda.peg'
import * as lib from '../grammar/pagoda'
import { trying } from '../lib/Result'

const sleep = (n: number) => new Promise(r => setTimeout(r, n))

const loadProgram = (src: string) =>
  trying(() => {
    return parse<lib.Program>(src, { lib, ambient: true })
  })

let running = false

export default function Stage({ rom }: { rom: string }) {
  const log = useConsole()
  const rt = new lib.Runtime(async stmt => {
    switch (stmt.type) {
      case 'narration':
      case 'dialogue':
        log.println(rt.getText(stmt))
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
