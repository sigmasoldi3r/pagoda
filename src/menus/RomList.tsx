import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { useScreen } from '../components/Screen'
import { Rom, RomHeader } from '../lib/storage/Rom'
import MainMenu from './MainMenu'
import * as db from '../lib/storage/database'
import RomDetails from './RomDetails'

async function listRoms(): Promise<db.RomEntry[]> {
  const result = (await db.roms.getAll()) as db.RomDBEntity[]
  return result.map(r => {
    const header = Rom.decodeHeaders(r.data) as any
    header.id = r.id
    return header
  })
}

// This menu shows the list of ROMs available.
export default function RomList() {
  const [roms, setRoms] = useState<db.RomEntry[] | null>(null)
  const go = useScreen()
  function goBack() {
    go(<MainMenu />)
  }
  function loadRomDetails(rom: db.RomEntry) {
    return () => {
      go(<RomDetails header={rom} />)
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
                  onClick={loadRomDetails(rom)}
                  key={`_rom${i}`}
                  style={{
                    border: '1px solid gray',
                    backgroundColor: '#222',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {rom.name} v{rom.version.join('.')} by {rom.author}
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
