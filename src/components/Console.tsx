import { Dispatch, useEffect, useState } from 'react'

class ConsoleContext {
  constructor(
    readonly text: JSX.Element,
    private readonly update: Dispatch<React.SetStateAction<JSX.Element>>
  ) {}
  print(text: JSX.Element | string) {
    if (typeof text === 'string') {
      text = (
        <>
          {text.split('\n').map(s => (
            <>
              {s} <br />
            </>
          ))}
        </>
      )
    }
    return this.update(s => {
      return (
        <>
          {s} {text}
        </>
      )
    })
  }
  println(text: JSX.Element | string) {
    return this.print(
      <>
        {text} <br />
      </>
    )
  }
  clear() {
    this.update(<></>)
  }
}

export function useConsole() {
  const [text, setText] = useState<JSX.Element>(<></>)
  return new ConsoleContext(text, setText)
}

const contexts: ConsoleContext[] = []
export const context = {
  print(str: string) {
    contexts.forEach(s => s.print(str))
  },
  println(str: string) {
    contexts.forEach(s => s.println(str))
  },
  clear() {
    contexts.forEach(s => s.clear())
  },
}

export default function Console({ context }: { context: ConsoleContext }) {
  useEffect(() => {
    const ctx = context
    contexts.push(ctx)
    return () => {
      const found = contexts.findIndex(c => c === ctx)
      if (found > -1) {
        contexts.splice(found, 1)
      }
    }
  }, [])
  return <code>{context.text}</code>
}
