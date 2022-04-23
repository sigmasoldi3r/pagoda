import * as pako from 'pako'
import { option, none, some } from '@octantis/option'
import { parse } from '../../grammar/pagoda.peg'
import * as lib from '../../grammar/pagoda'
import { trying } from '../Result'

/**
 * Project level information.
 * Contains program, logic and levels.
 *
 * Steps to save a ROM: Create a new Rom object,
 * fill the scripts and options, add assets maybe.
 * Then invoke toURL(), append as http://sigmasoldi3r.github.io/pagoda?rom=the-generated-url-here
 */
export class Rom {
  static fromBinary(bufferLike: ArrayBuffer | Uint8Array | Buffer) {
    const buffer = Buffer.from(bufferLike)
    const decoded = Buffer.from(pako.inflate(buffer)).toString()
    const raw = JSON.parse(decoded)
    const rom = new Rom()
    rom.author = raw.author
    rom.name = raw.name
    rom.version = raw.version
    rom.entry = raw.entry
    for (const [key, content] of Object.entries(raw.scripts)) {
      rom.scripts[key] = Buffer.from(
        pako.inflate(Buffer.from(content as string, 'base64'))
      ).toString()
    }
    return rom
  }
  /** Parses form a base64 string the current ROM information. */
  static fromText(component: string): Rom {
    return Rom.fromBinary(Buffer.from(component, 'base64'))
  }

  /** Parses the ROM from the current window location. */
  static fromCurrentURL(): option<Rom> {
    const url = new URL(document.location.toString())
    const param = url.searchParams.get('rom')
    if (param == null) {
      return none()
    }
    return some(Rom.fromText(decodeURIComponent(param)))
  }
  baseURL = 'http://sigmasoldi3r.github.io/pagoda'

  scripts: Record<string, string> = {}
  name = 'Unnamed'
  author = 'Unknown Pagoda fella'
  version = [1, 0, 0]
  entry = 'init.pag'

  /** Try parse the script. */
  getScript(name: string) {
    return trying(() => {
      const file = this.scripts[name]
      if (file == null) {
        throw new Error(`No file named ${file}`)
      }
      return parse<lib.Program>(file, { grammarSource: name })
    })
  }

  /** Serializes this ROM as a .rom file. */
  serialize() {
    const data = {
      name: this.name,
      author: this.author,
      version: this.version,
      entry: this.entry,
      scripts: Object.entries(this.scripts).reduce((o, [name, src]) => {
        o[name] = Buffer.from(pako.deflate(src)).toString('base64')
        return o
      }, {}),
    }
    return pako.deflate(JSON.stringify(data))
  }

  downloadAsFile() {
    const a = document.createElement('a')
    a.href = `data:application/octet-stream;base64,${this.serializeBase64()}`
    a.download = this.name + '.rom'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  /** Encodes the room into an ascii compatible medium. */
  serializeBase64() {
    return Buffer.from(this.serialize()).toString('base64')
  }

  /** Converts the rom object into a ready to copy-and-paste URL */
  serializeURL() {
    return this.baseURL + '?rom=' + encodeURIComponent(this.serializeBase64())
  }
}
