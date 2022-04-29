import { useState } from 'react'
import * as lib from '../../grammar/pagoda'

export interface ChoiceProps {
  done: () => void
  options: [lib.ChoiceCase, string][]
  rt: lib.Runtime
  def: lib.Choice
  title: string
}

export default function ChoiceMenu({ done, title, rt, options }: ChoiceProps) {
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
