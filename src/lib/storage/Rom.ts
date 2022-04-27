import * as pako from 'pako'
import { option, none, some } from '@octantis/option'
import { parse } from '../../grammar/pagoda.peg'
import * as lib from '../../grammar/pagoda'
import { trying } from '../Result'

export type RomHeader = Pick<Rom, 'author' | 'name' | 'version' | 'entry'> & {
  scriptNames: string[]
  assetNames: string[]
}
export type DeflatedRom = Omit<RomHeader, 'scriptNames' | 'assetNames'> & {
  scripts: Record<string, Uint8Array>
  assets: Record<string, Uint8Array>
}

export type Profile = {
  name: string
  data: any
}
export type ProfileDescriptor =
  | {
      type: 'profiles'
      limit?: number
      data: Profile[]
    }
  | {
      type: 'saves'
      limit?: number
      data: any[]
    }

type Meta = { [key: string]: number | string | undefined | Meta }
export type Metadata = {
  manifest?: {
    storage?: 'save' | 'profile' | 'auto-profile' | 'arcade' | 'none' | 'hybrid'
    max_profiles?: number
    max_saves?: number
    max_arcade_entries?: number
  } & Meta
  name: string
  author: string
  version: string
  entry?: string
  desc?: string
  site?: string
  collaborators?: string
  license?: string
  contact?: string
  support?: string
  issues?: string
  changelog?: string
} & Meta

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
  static decode(data: Uint8Array) {
    const partial = Rom.inflate(data)
    const rom = new Rom()
    rom.copy(partial)
    for (const [key, content] of Object.entries(partial.scripts)) {
      rom.scripts[key] = Buffer.from(pako.inflate(content)).toString()
    }
    return rom
  }

  /** Returns a partially decoded ROM where binary data is not yet inflated. */
  static inflate(data: Uint8Array): DeflatedRom {
    const inflated = pako.inflate(data)
    const decoded = Buffer.from(inflated).toString()
    const raw = JSON.parse(decoded)
    for (const [key, content] of Object.entries(raw.scripts)) {
      raw.scripts[key] = Buffer.from(content as string, 'base64')
    }
    return raw
  }

  /** Partial decode only of the header data. */
  static decodeHeaders(data: Uint8Array): RomHeader {
    const partial = Rom.inflate(data) as Partial<DeflatedRom>
    const { scripts, assets } = partial
    delete partial.scripts
    delete partial.assets
    const header = partial as RomHeader
    header.assetNames = Object.keys(assets ?? {})
    header.scriptNames = Object.keys(scripts ?? {})
    return header
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
  /** @deprecated */
  baseURL = 'http://sigmasoldi3r.github.io/pagoda'

  scripts: Record<string, string> = {}
  assets: Record<string, Uint8Array> = {}
  /** @deprecated */
  name = 'Unnamed'
  /** @deprecated */
  author = 'Unknown Pagoda fella'
  /** @deprecated */
  version = [1, 0, 0]
  /** @deprecated */
  entry = 'init.pag'
  profiles: ProfileDescriptor = {
    type: 'profiles',
    limit: 3,
    data: [],
  }
  meta: Metadata = {
    author: 'Unknown',
    name: 'No name',
    version: '1.0.0',
  }

  copy(headers: DeflatedRom | RomHeader): void {
    this.meta.author = headers.author
    this.meta.version = headers.version.join('.')
    this.meta.name = headers.name
    this.meta.entry = headers.entry
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
      name: this.meta.name,
      author: this.meta.author,
      version: this.meta.version,
      entry: this.meta.entry ?? 'init',
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
