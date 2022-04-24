import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { useScreen } from '../components/Screen'
import { Rom, RomHeader } from '../lib/storage/Rom'
import MainMenu from './MainMenu'
import * as db from '../lib/storage/database'
import Icon from '../components/Icon'
import Stage from './Stage'
import diskette from '../icons/diskette.png'
import pen from '../icons/pen.png'
import trash from '../icons/trash.png'

type RomDBEntity = { id: number; data: Uint8Array; name: string }
type RomEntry = Pick<RomDBEntity, 'id'> & RomHeader

async function listRoms(): Promise<RomEntry[]> {
  const result = (await db.roms.getAll()) as RomDBEntity[]
  return result.map(r => {
    const header = Rom.decodeHeaders(r.data) as any
    header.id = r.id
    return header
  })
}

// This menu shows the list of ROMs available.
export default function RomList() {
  const [roms, setRoms] = useState<RomEntry[] | null>(null)
  const go = useScreen()
  function goBack() {
    go(<MainMenu />)
  }
  function loadRom(header: RomEntry) {
    return async () => {
      const rom = await db.roms.get(header.id)
      if (rom == null) {
        console.warn(`Failed to retrieve ${header.id} ROM!`)
      } else {
        const data = Rom.decode((rom as any).data)
        go(<Stage rom={data} />)
      }
    }
  }
  async function loadRoms() {
    const roms = await listRoms()
    console.log(roms)
    setRoms(roms)
  }
  useEffect(() => {
    loadRoms()
  }, [])
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <h3>My ROMs</h3>
      {roms == null ? (
        <div>Loading ROMs...</div>
      ) : (
        <div
          style={{
            height: '100%',
            border: '1px solid gray',
            margin: '2rem',
            padding: '2rem',
          }}
        >
          {roms.length === 0 ? (
            <>Your ROM list is empty!</>
          ) : (
            <>
              Listing {roms.length} rom{roms.length === 1 ? '' : 's'}
              <br />
              <br />
              {roms.map((rom, i) => (
                <div
                  key={`_rom${i}`}
                  style={{ borderBottom: '1px solid gray' }}
                >
                  {rom.name} v{rom.version.join('.')} by {rom.author}
                  &nbsp;
                  <Button onClick={loadRom(rom)}>
                    <Icon src={diskette} /> Load
                  </Button>
                  <Button onClick={loadRom(rom)}>
                    <Icon src={pen} /> Edit
                  </Button>
                  <Button onClick={loadRom(rom)}>
                    <Icon src={trash} /> Delete
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      <Button className="wide" onClick={goBack}>
        Go back
      </Button>
    </div>
  )
}
