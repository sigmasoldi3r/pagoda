import * as monaco from 'monaco-editor'
import { useEffect, useRef } from 'react'
import Button from '../components/Button'
import { Rom } from '../lib/storage/Rom'

let once = false

export interface RomEditorProps {
  rom?: Rom
}

// Rom project editor.
export default function RomEditor({ rom }: RomEditorProps) {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (once) return
    once = true
    if (ref.current != null) {
      const ed = monaco.editor.create(ref.current, {
        theme: 'vs-dark',
        model: monaco.editor.createModel('# Test\nreadme', 'markdown'),
      })
      ed.layout()
    }
  }, [])
  return (
    <div style={{ height: '100%' }}>
      <Button>Hello!</Button>
      <div style={{ height: '100%' }} ref={ref as any}></div>
    </div>
  )
}
