import Button from '../components/Button'
import disketteIcon from '../icons/diskette.png'
import folderIcon from '../icons/folder.png'
import cogIcon from '../icons/cog_wheel.png'
import newPackageIcon from '../icons/new_package.png'
import scriptIcon from '../icons/add_text.png'
import pagodaLogo from '../logo.png'
import Icon from '../components/Icon'
import * as builtins from '../roms'
import * as db from '../lib/storage/database'
import { useEffect, useState } from 'react'
import MenuLike from '../components/MenuLike'
import uploadFile from '../components/FileUploader'
import { prompt } from '../components/Dialog'
import alert from '../components/Dialog/Alert'
import { useNavigate } from 'react-router-dom'
import lock from '../components/Dialog/LockDialog'
import { Rom } from '../lib/storage/Rom'
import { t } from '../lib/translate'

// Main menu component.
export default function MainMenu() {
  const [alreadyExists, setAlreadyExists] = useState(true)
  useEffect(() => {
    db.roms.getAll().then(all => {
      const one = all.find(row => row.name === builtins.Survivors.meta.name)
      if (one == null) {
        setAlreadyExists(false)
      }
    })
  }, [])
  const navigate = useNavigate()
  function openRom() {
    navigate(`/rom/list`)
  }
  async function importRom() {
    for (const [file] of await uploadFile()) {
      await lock.safe('Processing files...', async () => {
        const data = await file.arrayBuffer()
        const rom = Rom.decode(new Uint8Array(data))
        const id = await rom.persist()
        await alert(t`Done! Imported ROM file ${file.name} as ${rom.meta.name}`)
      })
    }
    // navigate(`/rom/import`)
  }
  async function createRom() {
    navigate(`/rom/new`)
  }
  async function goToOptions() {
    if (await prompt('Clear all ROMs?', 'boolean')) {
      const list = await db.roms.getAll()
      for (const rom of list) {
        await db.roms.delete(rom.id)
      }
      await alert(`Deleted ${list.length} ROMs!`)
      setAlreadyExists(false)
    }
    // navigate(`/settings`)
  }
  async function importSampleRom() {
    const [close] = lock(`Importing ROMs...`)
    try {
      await builtins.Survivors.persist()
      console.log('Done!')
      setAlreadyExists(true)
      db.roms.consoleTable()
    } finally {
      close()
    }
  }
  return (
    <MenuLike>
      <div style={{ textAlign: 'center' }}>
        <Icon
          imgStyle={{ left: 'calc(-64px + 16px/2 - 1px)', width: '128px' }}
          src={pagodaLogo}
        />
        <h1>Pagoda Engine</h1>
      </div>
      <Button onClick={openRom}>
        <Icon src={folderIcon} /> &nbsp;Open a ROM
      </Button>
      <Button onClick={importRom}>
        <Icon src={disketteIcon} /> &nbsp;Import a ROM file
      </Button>
      <Button disabled={alreadyExists} onClick={importSampleRom}>
        <Icon src={disketteIcon} /> &nbsp;Import examples
      </Button>
      <Button link="/rom/new">
        <Icon src={newPackageIcon} /> &nbsp;Create a new ROM
      </Button>
      <Button link="/manual">
        <Icon src={scriptIcon} /> &nbsp;Guide
      </Button>
      <Button onClick={goToOptions}>
        <Icon src={cogIcon} /> &nbsp;Options
      </Button>
    </MenuLike>
  )
}
