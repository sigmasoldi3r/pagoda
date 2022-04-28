import { useEffect, useState } from 'react'
import { useNav } from '../components/Nav'
import { Rom, RomInfo } from '../lib/storage/Rom'
import RomDetails from './RomDetails'

// This menu shows the list of ROMs available.
export default function RomList() {
  const [roms, setRoms] = useState<RomInfo[] | null>(null)
  const nav = useNav()
  function loadRomDetails(rom: RomInfo) {
    return () => {
      nav.push(<RomDetails header={rom} />)
    }
  }
  async function loadRoms() {
    const roms = await Rom.fromDatabase()
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
                  className="entry"
                >
                  {rom.meta.name} v{rom.meta.version} by {rom.meta.author}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
