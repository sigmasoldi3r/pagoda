import { none, option, some } from '@octantis/option'
import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import { Rom } from '../lib/storage/Rom'
import useOptionState from '../lib/useOptionState'
import addScript from '../icons/add_script.png'
import Icon from '../components/Icon'

export interface RomEditorProps {
  rom?: Rom
}

type Editor = monaco.editor.IStandaloneCodeEditor

// Rom project editor.
export default function RomEditor({ rom: preloadedRom }: RomEditorProps) {
  const ref = useRef<HTMLDivElement>()
  const [rom, setRom] = useOptionState<Rom>()
  const [editor, setEditor] = useOptionState<Editor>()
  const [editing, setEditing] = useState('init.pag')
  const [content, setContent] = useState('')
  useEffect(() => {
    if (preloadedRom != null) {
      setRom(preloadedRom)
    } else {
      setRom(new Rom())
    }
  }, [])
  useEffect(() => {
    console.log('Do', editor, ref.current)
    if (editor.isEmpty() && ref.current != null) {
      while (ref.current.firstChild) {
        if (ref.current.lastChild != null) {
          ref.current.removeChild(ref.current.lastChild)
        }
      }
      const ed = monaco.editor.create(ref.current, {
        theme: 'vs-dark',
        model: monaco.editor.createModel(
          `# Hello World

This is your project readme.
Feel free to edit.

\\*__Note__: This document will contain a detailed tutorial in the future.`,
          'markdown'
        ),
        fontFamily: 'Press Start',
        wordWrap: 'bounded',
        wrappingStrategy: 'advanced',
      })
      ed.layout()
      setContent(() => ed.getValue())
      setEditor(last => {
        for (const editor of last) {
          editor.dispose()
        }
        return ed
      })
      ed.onDidChangeModelContent(() => {
        setContent(() => ed.getValue())
      })
    }
  }, [rom])
  useEffect(() => {}, [editor])
  return (
    <div style={{ height: '100%' }}>
      <div className="editor">
        <div className="editor-items">
          {editor.zip(rom).fold(<></>, ([editor, rom]) => {
            const scripts = Object.entries(rom.scripts)
            const assets = Object.entries(rom.assets)
            return (
              <>
                <h3>ROM Content</h3>
                <small>{rom.name}</small>
                <p>SLOC: {content.length}</p>
                <hr />
                <div>
                  <h4>Scripts ({scripts.length})</h4>
                  <ul className="list">
                    {scripts.map(([key, script], i) => (
                      <li key={`_rom_script_${i}`} className="entry">
                        {key} ({script.length} bytes)
                      </li>
                    ))}
                  </ul>
                  <Button>
                    <Icon src={addScript} /> Create Script
                  </Button>
                </div>
                <div>
                  <h4>Assets ({assets.length})</h4>
                  <ul className="list">
                    {assets.map(([key, asset], i) => (
                      <li key={`_rom_asset_${i}`} className="entry">
                        {key} ({asset.length} bytes)
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )
          })}
        </div>
        <div className="editor-panel">
          <p>Editing {editing}</p>
          <div className="editor-instance" ref={ref as any}></div>
        </div>
      </div>
    </div>
  )
}
