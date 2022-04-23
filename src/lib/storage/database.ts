import GoDB from 'godb'

export const pagodaDb = new GoDB('pagoda-store')

export const roms = pagodaDb.table('roms')
