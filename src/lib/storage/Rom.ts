import * as pako from 'pako'
import { option, none, some } from '@octantis/option'
import { parse } from '../../grammar/pagoda.peg'
import * as lib from '../../grammar/pagoda'
import { trying } from '../Result'

export type RomHeader = Pick<Rom, 'author' | 'name' | 'version' | 'entry'>
export type DeflatedRom = RomHeader & { scripts: Record<string, Buffer> }

/**
 * Project level information.
 * Contains program, logic and levels.
 *
 * Steps to save a ROM: Create a new Rom object,
 * fill the scripts and options, add assets maybe.
 * Then invoke toURL(), append as http://sigmasoldi3r.github.io/pagoda?rom=the-generated-url-here
 */
export class Rom {
  /** Decodes a binary encoded ROM file. */
  static decode(data: BinaryData) {
    const partial = Rom.inflate(data)
    const rom = new Rom()
    rom.copy(partial)
    for (const [key, content] of Object.entries(partial.scripts)) {
      rom.scripts[key] = Buffer.from(pako.inflate(content)).toString()
    }
    return rom
  }

  /** Returns a partially decoded ROM where binary data is not yet inflated. */
  static inflate(data: BinaryData): DeflatedRom {
    const buffer = Buffer.from(data)
    const decoded = Buffer.from(pako.inflate(buffer)).toString()
    const raw = JSON.parse(decoded)
    for (const [key, content] of Object.entries(raw.scripts)) {
      raw[key] = Buffer.from(content as string, 'base64')
    }
    return raw
  }

  /** Partial decode only of the header data. */
  static decodeHeaders(data: BinaryData): RomHeader {
    const partial = Rom.inflate(data) as Partial<DeflatedRom>
    delete partial.scripts
    return partial as RomHeader
  }

  /** Parses form a base64 string the current ROM information. */
  static fromText(component: string): Rom {
    return Rom.decode(Buffer.from(component, 'base64'))
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

  copy(headers: DeflatedRom | RomHeader): void {
    this.author = headers.author
    this.version = headers.version
    this.name = headers.name
    this.entry = headers.entry
  }

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
  encode() {
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
    return Buffer.from(this.encode()).toString('base64')
  }

  /** Converts the rom object into a ready to copy-and-paste URL */
  serializeURL() {
    return this.baseURL + '?rom=' + encodeURIComponent(this.serializeBase64())
  }
}
