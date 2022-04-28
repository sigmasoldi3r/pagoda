import { useNav } from '../components/Nav'
import { Rom } from '../lib/storage/Rom'
import Stage from './Stage'
import * as db from '../lib/storage/database'
import Button from '../components/Button'
import Icon from '../components/Icon'
import diskette from '../icons/diskette.png'
import pen from '../icons/pen.png'
import trash from '../icons/trash.png'
import download from '../icons/download.png'
import { useState } from 'react'
import { none, option, some } from '@octantis/option'
import RomEditor from './RomEditor'
import { prompt } from '../components/Dialog'

// A simple menu with the details of the ROM.
// In the future this will contain splash art and such.
export default function RomDetails({ header: info }: { header: db.RomEntry }) {
  const nav = useNav()
  const [error, setError] = useState<string | null>(null)
  async function loadRom(): Promise<option<Rom>> {
    const rom = await db.roms.get(info.id)
    if (rom == null) {
      setError(`Failed to retrieve ${info.id} ROM!`)
      return none()
    } else {
      return some(Rom.decode((rom as any).data))
    }
  }
  async function goToRom() {
    for (const data of await loadRom()) {
      nav.push(<Stage rom={data} />)
    }
  }
  async function editRom() {
    for (const data of await loadRom()) {
      nav.push(<RomEditor rom={data} />)
    }
  }
  async function deleteRom() {
    if (await prompt(`Are you sure you want to delete this ROM?`, 'boolean')) {
      await db.roms.delete({
        id: info.id,
      })
      nav.pop()
    }
  }
  async function downloadRom() {
    for (const data of await loadRom()) {
      data.downloadAsFile()
    }
  }
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
        <h3>{info.meta.name}</h3>
        <hr />
        <p>Author: {info.meta.author}</p>
        <p>Version: {info.meta.version}</p>
        <div style={{ color: 'red' }}>{error}</div>
        <p>{info.meta.desc}</p>
        {info.meta.contact != null ? (
          <a href={`mailto:${info.meta.contact}`}>{info.meta.contact}</a>
        ) : null}
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
    </div>
  )
}
