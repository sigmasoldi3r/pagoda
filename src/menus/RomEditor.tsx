import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import '../grammar/editor'
import { Rom } from '../lib/storage/Rom'
import useOptionState from '../lib/useOptionState'
import Icon from '../components/Icon'
import addScriptIcon from '../icons/add_script.png'
import diskette from '../icons/diskette.png'
import addTextIcon from '../icons/add_text.png'
import uploadFileIcon from '../icons/upload_file.png'
import Input from '../components/Input'
import Exp from '../components/Exp'
import Metric from '../components/Metric'
import { prompt } from '../components/Dialog'
import { useSwipeable } from 'react-swipeable'
import lock from '../components/Dialog/LockDialog'
import alert from '../components/Dialog/Alert'

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
  const [rom, setRom, , updateRom] = useOptionState<Rom>()
  const [editor, setEditor] = useOptionState<Editor>()
  const [inputs, setInputs] = useState({ name: '', author: '', entry: '' })
  const [editing, setEditing] = useState<[Editables, string]>([
    'scripts',
    'init',
  ])
  const [content, setContent] = useState('')
  const [drawer, updateDrawer] = useState<'open' | 'closed'>('closed')
  const swiper = useSwipeable({
    onSwipedLeft: () => updateDrawer('closed'),
    onSwipedRight: () => updateDrawer('open'),
  })

  // METHODS //
  async function saveContents(
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
      return ['scripts', 'unknown']
    })
  }
  async function persistRom() {
    for (const r of rom) {
      saveContents(r, editor.get(), editing)
      const [close] = lock('Saving ROM...')
      const id = await r.persist()
      console.info(`Your ROM was saved as ${id}`)
      close()
      alert(`ROM saved!`)
    }
  }
  function getInitialContent(): [string, string] {
    for (const r of rom) {
      const entry = r.scripts[r.meta.entry ?? 'init']
      if (entry != null) {
        setEditing(['scripts', r.meta.entry ?? 'init'])
        return [entry, 'pagoda']
      }
    }
    return [
      `###
# Welcome to Pagoda script editor!
# This is your game entry point script, from here
# you can navigate to other scripts and create
# assets. Feel free to remove this comments.
#
# To get started read the docs about the Pagoda
# scripting language:
# https://github.com/sigmasoldi3r/pagoda
###`,
      'pagoda',
    ]
  }
  async function createScript() {
    for (const name of await prompt('Enter a file name')) {
      updateRom(rom =>
        rom.map(rom => {
          if (rom.scripts[name] == null) {
            rom.scripts[name] = ''
          }
          return rom
        })
      )
    }
  }
  async function uploadFile() {}
  async function createText() {}

  // EFFECTS //
  useEffect(() => {
    if (preloadedRom != null) {
      setRom(preloadedRom)
    } else {
      setRom(new Rom())
    }
  }, [])
  useEffect(() => {
    for (const {
      meta: { name, author, entry: _entry },
    } of rom) {
      const entry = _entry ?? 'init'
      setInputs({ name, author, entry })
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
    }
  }, [rom])
  return (
    <div style={{ height: '100%' }} {...swiper}>
      <div className="editor">
        <div className={`editor-items editor-items-${drawer}`}>
          {editor.zip(rom).fold(<></>, ([, rom]) => {
            const scripts = Object.entries(rom.scripts)
            const assets = Object.entries(rom.assets)
            return (
              <>
                <h3>ROM Content</h3>
                <Input
                  title="Name"
                  value={inputs.name}
                  onChange={e =>
                    setInputs(i => ({ ...i, name: e.target.value }))
                  }
                />
                <Input
                  title="Author"
                  value={inputs.author}
                  onChange={e =>
                    setInputs(i => ({ ...i, author: e.target.value }))
                  }
                />
                <Input
                  title="Entry Point"
                  value={inputs.entry}
                  onChange={e =>
                    setInputs(i => ({ ...i, entry: e.target.value }))
                  }
                />
                <Button onClick={persistRom}>
                  <Icon src={diskette} /> Save ROM
                </Button>
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
                        {key}
                        <Exp>
                          <Metric
                            value={script.length}
                            spaced
                            base="byte, bytes"
                          />
                        </Exp>
                      </li>
                    ))}
                  </ul>
                  <Button className="wide" onClick={createScript}>
                    <Icon src={addScriptIcon} /> Create Script
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
                        {key}
                        <Exp>
                          <Metric
                            value={asset.length}
                            spaced
                            base="byte, bytes"
                          />
                        </Exp>
                      </li>
                    ))}
                  </ul>
                  <Button className="wide" onClick={uploadFile}>
                    <Icon src={uploadFileIcon} /> Upload File
                  </Button>
                  <Button className="wide" onClick={createText}>
                    <Icon src={addTextIcon} /> Create Text
                  </Button>
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
