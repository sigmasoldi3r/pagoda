import * as monaco from 'monaco-editor'
import { useEffect, useRef } from 'react'
import Button from '../components/Button'

let once = false

// Rom project editor.
export default function RomEditor() {
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
