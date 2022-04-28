import GoDB from 'godb'
import { Rom } from './Rom'

export const pagodaDb = new GoDB('pagoda-store')

export const roms = pagodaDb.table('roms')

export type RomDBEntity = {
  id: number
  data: Uint8Array
  name: string
  meta: Rom['meta']
}
