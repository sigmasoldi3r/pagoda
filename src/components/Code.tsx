import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Runtime } from '../grammar/pagoda'
import pagoda from '../grammar/pagoda.peg'
import ErrorFormatter from './ErrorFormatter'
import * as Prism from 'prismjs'

export interface CodeProps {
  lang?: 'javascript' | 'pagoda' | 'css' | 'html'
  src: string
}

Prism.languages.pagoda = {
  string: {
    pattern: /((^|[^\\])"(?:\\.|[^\\"])*")|(:[^ \t\n\r\]\)#]+)/,
    greedy: true,
  },
  comment: {
    pattern: /#.*/,
    greedy: true,
  },
  number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?((st|nd|rd|th)|%)?\b/i,
  punctuation: /[{}[\],]/,
  operator: /\+-*\/<>=/,
  boolean: /\b(?:false|true|yes|no|high|low|on|off)\b/,
  variable: /invalid|valid|unit|null|nothing|nil|void|something/,
  keywords: {
    pattern:
      /\b(?:and|not|or|if|is|isnt|isn't|is not|'s|else|call|wait|always|never|section|end|choice|character|set|to|as|add|clear|with)\b/,
    alias: 'keyword',
  },
}

/** Simple code render. */
export default function Code({ lang, src }: CodeProps) {
  const [out, setOut] = useState<string | JSX.Element>('Running...')
  useEffect(() => {
    const rt = new Runtime(async function (stmt) {
      if (stmt.type === 'narration') {
        const content = await this.solve(stmt.text)
        setOut(o => (
          <>
            {o}
            <div className="narration-line">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </>
        ))
      } else if (stmt.type === 'dialogue') {
        const char = await this.solve(stmt.actor)
        const name = typeof char === 'string' ? char : char.name
        const content = await this.solve(stmt.text)
        setOut(o => (
          <>
            {o}
            <div className="narration-line">
              <span>{name}: </span>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </>
        ))
      }
      return stmt
    })
    try {
      setOut('')
      rt.start(pagoda.parse(src))
    } catch (err) {
      setOut(<ErrorFormatter err={err} text={src} source="inline" />)
    }
  }, [])
  return (
    <div
      style={{
        maxWidth: '100vw',
        wordWrap: 'break-word',
        border: '1px solid gray',
        margin: '0.5rem',
        padding: '0.5rem',
      }}
    >
      <pre style={{ marginBottom: 0, marginTop: 0 }}>
        <code
          style={{ fontFamily: 'Press Start' }}
          className={`language-${lang}`}
        >
          {src}
        </code>
      </pre>
      <hr />
      <small>Output:</small>
      <code style={{ wordWrap: 'break-word', maxWidth: '100%' }}>{out}</code>
    </div>
  )
}
