/*
  This view contains the docs for developing Pagoda games.
  A guide about the engine, and a guide about the language.
*/
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
      const h = await shiki.getHighlighter({
        langs: [
          {
            id: 'pagoda',
            path: '/pagoda.tmLanguage.json',
            scopeName: 'source.pagoda',
          },
        ],
      })
      update(h)
    })
  })
  const ref = useRef<HTMLElement>()
  return hl.fold(<></>, h => {
    if (ref.current != null) {
    }
    return (
      <CodeContext.Provider value={h}>
        <h1>Pagoda Manual</h1>
        <p>
          This page contains a summary of all that pagoda engine can offer,
          ranging from a simple usage documentation to a fully extended,
          in-depth guide about the language.
        </p>
        <h2>Basics</h2>
        <p>...</p>
        <h2>The Language</h2>
        <p>
          Pagoda Engine comes with a built-in, custom scripting language, an
          ad-hoc solution for the narrative nature of the engine.
        </p>
        <p>
          Programs are declared in this way, making them safe (As no malicious
          code execution is possible), and easier to script, as the language is
          designed to follow with the flow of the tale.
        </p>
        <p>
          Also Pagoda uses markdown for text highlight, a very well-known
          language that is used for simple documents.
        </p>
        <Code
          src={`##
# This is a sample Pagoda script
##

"Hello World!" # Show a "Hello world" message
wait # Wait for user input`}
          lang="bash"
        />
        <p>
          Although it takes alot from the "programming world", the language is
          intended to be readable at first glance, or almost for simple
          statements.
        </p>
        <p>This means that if you read something like:</p>
        <Code
          src={`
if inventory's 1st is nothing {
  "Oh! Nothing there"
}`}
          lang="ada"
        />
        <p>
          It means what you're thinking: If the 1st slot of the inventory
          contains nothing, then show a "Nothing there" message.
        </p>
      </CodeContext.Provider>
    )
  })
}
