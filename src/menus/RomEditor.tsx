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

function NoRom() {
  return <div>We're loading your ROM...</div>
}

let editor: option<monaco.editor.IStandaloneCodeEditor> = none()

// Rom project editor.
export default function RomEditor({ rom: preloadedRom }: RomEditorProps) {
  const ref = useRef<HTMLDivElement>()
  const [rom, setRom] = useOptionState<Rom>()
  const [editing, setEditing] = useState('init.pag')
  useEffect(() => {
    if (preloadedRom != null) {
      setRom(preloadedRom)
    } else {
      setRom(new Rom())
    }
  }, [])
  useEffect(() => {
    if (editor.isEmpty() && ref.current != null) {
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
      editor = some(ed)
    }
  }, [rom])
  return rom.fold(<NoRom />, rom => {
    const scripts = Object.entries(rom.scripts)
    const assets = Object.entries(rom.assets)
    return (
      <div style={{ height: '100%' }}>
        <div className="editor">
          <div className="editor-items">
            <h3>ROM Content</h3>
            <small>{rom.name}</small>
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
          </div>
          <h2></h2>
          <div className="editor-panel" ref={ref as any}></div>
        </div>
      </div>
    )
  })
}
