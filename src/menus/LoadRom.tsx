import { FormEvent, useEffect, useRef } from 'react'
import Console, { useConsole } from '../components/Console'
import { useNav } from '../components/Nav'
import { sleep } from '../lib/Coroutines'
import { Rom } from '../lib/storage/Rom'
import Stage from './Stage'
import * as roms from '../roms'

/** @deprecated */
export default function LoadRom() {
  const log = useConsole()
  const inputRef = useRef<HTMLInputElement>()
  const nav = useNav()
  useEffect(() => {
    for (const rom of Rom.fromCurrentURL()) {
      nav.push(<Stage rom={rom} />)
    }
  }, [])
  function load() {
    const input = inputRef.current
    input?.focus()
    input?.click()
  }
  async function handleFile(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const input = inputRef.current
    const file = input?.files?.item(0)
    log.println(`Loading ${file?.name}`)
    if (file == null) {
      return
    }
    const src = new Uint8Array(await file.arrayBuffer())
    log.println(`Parsing sources...`)
    if (src != null) {
      const rom = Rom.decode(src)
      log.println(`Loading ${rom.name}`)
      log.println(`By ${rom.author}`)
      log.println(`${Object.keys(rom.scripts).length} script(s) found.`)
      await sleep(1000)
      nav.push(<Stage rom={rom} />)
    }
  }
  return (
    <div style={{ width: '100%', height: '100%' }} onClick={load}>
      <h1 className="pulsating">No ROM loaded</h1>
      <small>Click anywhere to load a new one</small>
      <input
        onChange={handleFile}
        style={{ display: 'none' }}
        ref={inputRef as any}
        type="file"
      />
      <br />
      <br />
      <button
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          console.log('Dumping...')
          roms.testing.downloadAsFile()
        }}
      >
        Dump sample
      </button>
      <button
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          console.log('Dumping...')
          nav.push(<Stage rom={roms.testing} />)
        }}
      >
        Load sample
      </button>
      <br />
      <Console context={log} />
    </div>
  )
}
