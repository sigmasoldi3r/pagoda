import GoDB from 'godb'
import { RomInfo } from './Rom'

export const pagodaDb = new GoDB('pagoda-store')

export const roms = pagodaDb.table('roms')

export type RomDBEntity = { id: number; data: Uint8Array; name: string }
export type RomEntry = Pick<RomDBEntity, 'id'> & RomInfo
