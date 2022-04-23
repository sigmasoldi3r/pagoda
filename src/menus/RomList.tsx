import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { useScreen } from '../components/Screen'
import { Rom } from '../lib/storage/Rom'
import MainMenu from './MainMenu'

// This menu shows the list of ROMs available.
export default function RomList() {
  const [roms, setRoms] = useState<Rom[] | null>(null)
  const go = useScreen()
  function goBack() {
    go(<MainMenu />)
  }
  async function loadRoms() {
    setRoms([])
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
          {roms.length === 0 ? <>Your ROM list is empty!</> : <>Rom list</>}
        </div>
      )}
      <Button className="wide" onClick={goBack}>
        Go back
      </Button>
    </div>
  )
}
