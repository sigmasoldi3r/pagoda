/*
  This view contains the docs for developing Pagoda games.
  A guide about the engine, and a guide about the language.
*/
import { none, option } from '@octantis/option'
import { createContext, useContext, useEffect, useRef } from 'react'
import * as shiki from 'shiki'
import lock from '../components/Dialog/LockDialog'
import useOptionState from '../lib/useOptionState'

shiki.setCDN('https://unpkg.com/shiki/')

const CodeContext = createContext<shiki.Highlighter>(null as any)

export function Code({ src, lang = 'js' }: { lang?: string; src: string }) {
  const ref = useRef<HTMLDivElement>()
  const ctx = useContext(CodeContext)
  useEffect(() => {
    if (ref.current?.innerHTML != null) {
      ref.current.innerHTML = ctx.codeToHtml(src, { lang })
    }
  }, [ref])
  return <div ref={ref as any} />
}

// This view contains all the docs.
export default function Manual() {
  const [hl, update] = useOptionState<shiki.Highlighter>()
  useEffect(() => {
    lock.safe('Loading manual...', async () => {
      const h = await shiki.getHighlighter({})
      update(h)
    })
  })
  const ref = useRef<HTMLElement>()
  return hl.fold(<></>, h => {
    if (ref.current != null) {
    }
    return (
      <CodeContext.Provider value={h}>
        Docs: <Code src="const f = x => x*2" />
      </CodeContext.Provider>
    )
  })
}
