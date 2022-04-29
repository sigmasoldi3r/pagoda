import { ReactNode } from 'react'
import useRomLoader from '../lib/romLoadEffect'
import { Rom } from '../lib/storage/Rom'

/** ROM Provider element. */
export default function RomProvider({
  id,
  map,
}: {
  id: number
  map: (rom: Rom) => JSX.Element
}) {
  const rom = useRomLoader(id)
  return rom.fold(<></>, map)
}
