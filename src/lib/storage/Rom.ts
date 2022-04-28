import * as pako from 'pako'
import { option, none, some } from '@octantis/option'
import { parse } from '../../grammar/pagoda.peg'
import * as lib from '../../grammar/pagoda'
import { trying } from '../Result'
import { RomDBEntity, roms } from './database'

export type RomInfo = Pick<Rom, 'meta' | 'localID' | 'profiles'> & {
  data: Uint8Array
}
export type PartialRom = Omit<Rom, 'scriptNames' | 'assetNames'> & {
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
  /** Recovers one or all ROMs based on the ID, if provided. */
  static async fromDatabase(id?: number) {
    if (id != null) {
      const result = (await roms.get(id)) as RomDBEntity
      const header = Rom.decodeHeaders(result.data)
      header.localID = result.id
      header.data = result.data
      return [header]
    }
    const result = (await roms.getAll()) as RomDBEntity[]
    return result.map(r => {
      const header = Rom.decodeHeaders(r.data)
      header.localID = r.id
      return header
    })
  }

  /** Decodes a binary encoded ROM file. */
  static decode(data: Uint8Array, id?: number) {
    const partial = Rom.inflate(data)
    const rom = new Rom()
    if (id != null) {
      rom.localID = id
      partial.localID = id
    }
    rom.copy(partial)
    for (const [key, content] of Object.entries(partial.scripts)) {
      rom.scripts[key] = Buffer.from(pako.inflate(content)).toString()
    }
    return rom
  }

  /** Returns a partially decoded ROM where binary data is not yet inflated. */
  static inflate(data: Uint8Array): PartialRom {
    const inflated = pako.inflate(data)
    const decoded = Buffer.from(inflated).toString()
    const raw = JSON.parse(decoded)
    for (const [key, content] of Object.entries(raw.scripts)) {
      raw.scripts[key] = Buffer.from(content as string, 'base64')
    }
    for (const [key, content] of Object.entries(raw.assets)) {
      raw.assets[key] = Buffer.from(content as string, 'base64')
    }
    return raw
  }

  /** Partial decode only of the header data. */
  static decodeHeaders(data: Uint8Array): RomInfo {
    const partial = Rom.inflate(data) as Partial<PartialRom>
    delete partial.scripts
    delete partial.assets
    const header = partial as RomInfo
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

  /** Scripts contained in this ROM, in pagoda script. */
  scripts: Record<string, string> = {}
  /** Any text or binary assets. */
  assets: Record<string, Uint8Array> = {}
  /** Local persistence identifier, present if serialized. */
  localID?: number
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

  copy(partial: PartialRom | RomInfo): void {
    this.meta.author = partial.meta.author
    this.meta.version = partial.meta.version
    this.meta.name = partial.meta.name
    this.meta.entry = partial.meta.entry
    this.localID = partial.localID
    this.profiles = partial.profiles
  }

  /** Try parse the script. */
  getScript(name: string) {
    return trying(() => {
      const file = this.scripts[name ?? 'init']
      if (file == null) {
        throw new Error(`No file named ${name}`)
      }
      return parse<lib.Program>(file, { grammarSource: name })
    })
  }

  /** Serializes this ROM as a .rom file. */
  encode() {
    const data = {
      meta: this.meta,
      assets: Object.entries(this.assets).reduce((o, [name, src]) => {
        o[name] = Buffer.from(pako.deflate(src)).toString('base64')
        return o
      }, {}),
      scripts: Object.entries(this.scripts).reduce((o, [name, src]) => {
        o[name] = Buffer.from(pako.deflate(src)).toString('base64')
        return o
      }, {}),
    }
    return pako.deflate(JSON.stringify(data))
  }

  /** Creates an octet stream type link and opens it. */
  downloadAsFile() {
    const a = document.createElement('a')
    a.href = `data:application/octet-stream;base64,${this.serializeBase64()}`
    a.download = this.meta.name + '.rom'
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
    return (
      /*this.baseURL + */ '?rom=' + encodeURIComponent(this.serializeBase64())
    )
  }

  /** If a local ID is present, it attempts to update the entry. Inserts otherwise. */
  async persist() {
    console.log(this.localID)
    if (this.localID != null) {
      const found = await roms.get(this.localID)
      if (found != null && found.id === this.localID) {
        const { id } = await roms.put({
          id: this.localID,
          name: this.meta.name,
          meta: this.meta,
          data: this.encode(),
        })
        this.localID = id
        return id
      }
    }
    const { id } = await roms.add({
      name: this.meta.name,
      meta: this.meta,
      data: this.encode(),
    })
    this.localID = id
    return id
  }
}
