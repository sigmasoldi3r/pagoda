import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { Rom, RomInfo } from '../lib/storage/Rom'
import { t } from '../lib/translate'
import useOptionState from '../lib/useOptionState'

export type RomsProp = { roms: RomInfo[] }

// Atomic element: The ROM list content.
export function RomListElement({ roms }: RomsProp) {
  if (roms.length === 0) {
    return <>{t`Your ROM list is empty!`}</>
  }
  return (
    <>
      Listing {roms.length} rom{roms.length === 1 ? '' : 's'}
      <br />
      <br />
      {roms.map((rom, i) => (
        <Link to={`/rom/${rom.localID}`} key={`_rom${i}`} className="entry">
          {rom.meta.name} v{rom.meta.version} by {rom.meta.author}
        </Link>
      ))}
    </>
  )
}

// The panel wrapper.
export function RomListPanel({ roms }: RomsProp) {
  return (
    <div
      style={{
        height: '100%',
        border: '1px solid gray',
        margin: '2rem',
        padding: '2rem',
      }}
    >
      <RomListElement roms={roms} />
    </div>
  )
}

// This menu shows the list of ROMs available.
export default function RomList() {
  const [roms, setRoms] = useOptionState<RomInfo[]>()
  const navigate = useNavigate()
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
      {roms.fold(<div>Loading ROMs...</div>, roms => (
        <RomListPanel roms={roms} />
      ))}
      <Button onClick={() => navigate('/')} size="small">
        Back
      </Button>
    </div>
  )
}
