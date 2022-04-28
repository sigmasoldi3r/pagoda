import { useNav } from '../components/Nav'
import { Rom, RomInfo } from '../lib/storage/Rom'
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

function getOrDie<T>(what: T | undefined): T {
  if (what == null) throw new Error(`Invalid ROM!`)
  return what
}

// A simple menu with the details of the ROM.
// In the future this will contain splash art and such.
export default function RomDetails({ header: info }: { header: RomInfo }) {
  const id = getOrDie(info.localID)
  const nav = useNav()
  const [error, setError] = useState<string | null>(null)
  async function loadRom(): Promise<option<Rom>> {
    const [rom] = await Rom.fromDatabase(id)
    if (rom == null) {
      setError(`Failed to retrieve ${id} ROM!`)
      return none()
    } else {
      return some(Rom.decode(rom.data, id))
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
      await db.roms.delete({ id })
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
        {info.meta.collaborators != null ? (
          <p>collaborators: {info.meta.collaborators}</p>
        ) : null}
        {info.meta.contact != null ? (
          <p>
            Contact:{' '}
            <a rel="self" target="_blank" href={`mailto:${info.meta.contact}`}>
              {info.meta.contact}
            </a>
          </p>
        ) : null}
        {info.meta.site != null ? (
          <p>
            Site:{' '}
            <a rel="self" target="_blank" href={info.meta.site}>
              {new URL(info.meta.site).host}
            </a>
          </p>
        ) : null}
        {info.meta.support != null ? (
          <p>
            Support:{' '}
            <a rel="self" target="_blank" href={info.meta.support}>
              {info.meta.support}
            </a>
          </p>
        ) : null}
        <div style={{ color: 'red' }}>{error}</div>
        <p>{info.meta.desc}</p>
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
