import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import { Rom } from '../lib/storage/Rom'
import useOptionState from '../lib/useOptionState'
import addScript from '../icons/add_script.png'
import Icon from '../components/Icon'
import '../grammar/editor'

export interface RomEditorProps {
  rom?: Rom
}

type Editor = monaco.editor.IStandaloneCodeEditor
type Editables = Extract<keyof Rom, 'assets' | 'scripts'>

export const textLike =
  /\.(md|txt|license|ignore|js|ts|html|css|xml|conf|ini|toml|php|json|pag)$/i

export const langByExtension = {
  md: 'markdown',
  js: 'javascript',
  ts: 'typescript',
  php: 'php',
  xml: 'xml',
  html: 'html',
  xhtml: 'html',
  css: 'css',
  conf: 'toml',
  ini: 'toml',
  toml: 'toml',
  json: 'json',
  pag: 'pagoda',
}
/** Get a language name for monaco by extension or return 'text'. */
function getLang(ext: string) {
  return langByExtension[ext] ?? 'text'
}

// Rom project editor.
export default function RomEditor({ rom: preloadedRom }: RomEditorProps) {
  const ref = useRef<HTMLDivElement>()
  const [rom, setRom] = useOptionState<Rom>()
  const [editor, setEditor] = useOptionState<Editor>()
  const [editing, setEditing] = useState<[Editables, string]>([
    'assets',
    'readme.md',
  ])
  const [content, setContent] = useState('')

  // METHODS //
  function saveContents(
    rom: Rom,
    editor: Editor,
    [type, name]: typeof editing
  ) {
    if (type === 'assets') {
      rom.assets[name] = new Uint8Array(
        [...editor.getValue()].map(c => c.charCodeAt(0))
      )
    } else {
      rom.scripts[name] = editor.getValue()
    }
  }
  function updateEditing(target: typeof editing) {
    let once = 0
    return setEditing(prev => {
      if (once++ > 0) return target
      const ed = editor
      const rm = rom
      const [type, name] = target
      const ext = name.match(/\.([^\.]+)$/i)?.[1] ?? 'txt'
      const lang = getLang(ext)
      for (const [editor, rom] of ed.zip(rm)) {
        saveContents(rom, editor, prev)
        if (type === 'assets') {
          const buffer = Buffer.from(rom.assets[name])
          editor.setModel(monaco.editor.createModel(buffer.toString(), lang))
        } else {
          editor.setModel(
            monaco.editor.createModel(rom.scripts[name], 'pagoda')
          )
        }
        return target
      }
      return ['scripts', 'unknown.pag']
    })
  }

  function getInitialContent(): [string, string] {
    for (const r of rom) {
      if (r.assets['readme.md'] != null) {
        return [Buffer.from(r.assets['readme.md']).toString(), 'markdown']
      }
    }
    return [
      `# Hello World

This is your project readme.
Feel free to edit.

\\*__Note__: This document will contain a detailed tutorial in the future.`,
      'markdown',
    ]
  }

  // EFFECTS //
  useEffect(() => {
    if (preloadedRom != null) {
      setRom(preloadedRom)
    } else {
      setRom(new Rom())
    }
  }, [])
  useEffect(() => {
    if (editor.isEmpty() && ref.current != null) {
      while (ref.current.firstChild) {
        if (ref.current.lastChild != null) {
          ref.current.removeChild(ref.current.lastChild)
        }
      }
      const ed = monaco.editor.create(ref.current, {
        theme: 'vs-dark',
        model: monaco.editor.createModel(...getInitialContent()),
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
                      <li
                        key={`_rom_script_${i}`}
                        className="entry"
                        onClick={() => updateEditing(['scripts', key])}
                      >
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
                      <li
                        key={`_rom_asset_${i}`}
                        className="entry"
                        onClick={() => {
                          if (key.match(textLike)) {
                            updateEditing(['assets', key])
                          }
                        }}
                      >
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
          <p>Editing {editing.join('/')}</p>
          <div className="editor-instance" ref={ref as any}></div>
        </div>
      </div>
    </div>
  )
}
