import * as pako from 'pako'
import { option, none, some } from '@octantis/option'

/**
 * Project level information.
 * Contains program, logic and levels.
 *
 * Steps to save a ROM: Create a new Rom object,
 * fill the scripts and options, add assets maybe.
 * Then invoke toURL(), append as http://sigmasoldi3r.github.io/pagoda?rom=the-generated-url-here
 */
export class Rom {
  /** Parses form a base64 string the current ROM information. */
  static fromText(component: string): Rom {
    const decoded = Buffer.from(
      pako.inflate(Buffer.from(component, 'base64'))
    ).toString()
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

  /** Serializes this ROM as a .rom file. */
  toRomFile() {
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

  /** Encodes the room into an ascii compatible medium. */
  toURLComponent() {
    console.log(this.toRomFile())
    return Buffer.from(this.toRomFile()).toString('base64')
  }

  /** Converts the rom object into a ready to copy-and-paste URL */
  toURL() {
    return this.baseURL + '?rom=' + encodeURIComponent(this.toURLComponent())
  }
}
