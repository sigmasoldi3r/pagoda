import { useScreen } from '../components/Screen'
import { Rom } from '../lib/storage/Rom'
import Stage from './Stage'
import * as db from '../lib/storage/database'
import Button from '../components/Button'
import Icon from '../components/Icon'
import diskette from '../icons/diskette.png'
import pen from '../icons/pen.png'
import trash from '../icons/trash.png'
import download from '../icons/download.png'
import RomList from './RomList'
import { useState } from 'react'
import { none, option, some } from '@octantis/option'
import RomEditor from './RomEditor'

// A simple menu with the details of the ROM.
// In the future this will contain splash art and such.
export default function RomDetails({ header }: { header: db.RomEntry }) {
  const go = useScreen()
  const [error, setError] = useState<string | null>(null)
  async function loadRom(): Promise<option<Rom>> {
    const rom = await db.roms.get(header.id)
    if (rom == null) {
      setError(`Failed to retrieve ${header.id} ROM!`)
      return none()
    } else {
      return some(Rom.decode((rom as any).data))
    }
  }
  async function goToRom() {
    for (const data of await loadRom()) {
      go(<Stage rom={data} />)
    }
  }
  async function editRom() {
    for (const data of await loadRom()) {
      go(<RomEditor rom={data} />)
    }
  }
  function goBack() {
    go(<RomList />)
  }
  function deleteRom() {}
  function downloadRom() {}
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        <h2>ROM Details</h2>
        <h3>{header.name}</h3>
        <hr />
        <p>Author: {header.author}</p>
        <p>Version: {header.version.join('.')}</p>
        <div style={{ color: 'red' }}>{error}</div>
        <small>
          This rom contains:
          <br />
          {header.scriptNames.length} script(s) and {header.assetNames.length}{' '}
          asset(s)
        </small>
        <hr />
        <div
          style={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
          }}
        >
          <h4>Actions</h4>
          <Button onClick={goToRom}>
            <Icon src={diskette} /> Play
          </Button>
          <Button onClick={editRom}>
            <Icon src={pen} /> Edit
          </Button>
          <Button onClick={deleteRom}>
            <Icon src={trash} /> Delete
          </Button>
          <Button onClick={downloadRom}>
            <Icon src={download} /> Download
          </Button>
        </div>
      </div>
      <Button onClick={goBack}>Go back</Button>
    </div>
  )
}
