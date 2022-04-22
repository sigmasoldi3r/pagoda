import { FormEvent, useEffect, useRef } from 'react'
import Console, { useConsole } from '../components/Console'
import { useScreen } from '../components/Screen'
import './LoadRom.css'
import Stage from './Stage'

const rom = `
set vars to "Variables"
set such to "also those kind of "
"Test $vars and $(such + "things")"

set goUp to "Go $(1+2) uphill"

set elieen to "Elieen"

if elieen exists {
  elieen "Oh... I'm alive!"
}

"The player sees a mountain"

section die {
  "So the player dies: $_0"
  if _1 exists {
    "Also, $_1..."
  }
}

choice "What to do now?" {
  goUp {
    "Player decides to go uphills..."
    call die with "bad ending"
  }
  "go down" {
    "Player does (???)"
    call die with "bad ending" "the world ends"
  }
  "stay" {
    "A horny naga comes and seduces you"
    "Now you're happily married"
  }
}

"This is the end."

`

export default function LoadRom() {
  const log = useConsole()
  const inputRef = useRef<HTMLInputElement>()
  const goTo = useScreen()
  function load() {
    // const input = inputRef.current
    // input.focus()
    // input.click()
    goTo(<Stage rom={rom} />)
  }
  async function handleFile(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const input = inputRef.current
    const file = input?.files?.item(0)
    log.println(`Loading ${file?.name}`)

    const src = await file?.text()
    log.println(`Parsing sources...`)
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
      <Console context={log} />
    </div>
  )
}
