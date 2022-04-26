/*
  Some builtin ROMs
*/
import { Rom } from './lib/storage/Rom'

export const testing = new Rom()
testing.baseURL = 'http://localhost:3000'
testing.scripts['init.pag'] = `
`
