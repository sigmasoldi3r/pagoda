import Button from '../components/Button'
import diskette from '../icons/diskette.png'
import folder from '../icons/folder.png'
import cog from '../icons/cog_wheel.png'
import newPackage from '../icons/new_package.png'
import pagodaLogo from '../logo.png'
import Icon from '../components/Icon'
import RomList from './RomList'
import * as builtins from '../roms'
import * as db from '../lib/storage/database'
import { useEffect, useState } from 'react'
import MenuLike from '../components/MenuLike'
import RomCreationChoice from './RomCreationChoice'
import uploadFile from '../components/FileUploader'
import { prompt } from '../components/Dialog'
import alert from '../components/Dialog/Alert'
import { useNavigate } from 'react-router-dom'
import lock from '../components/Dialog/LockDialog'

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
    for (const files of await uploadFile()) {
      console.log(files[0])
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
        <Icon src={folder} /> &nbsp;Open a ROM
      </Button>
      <Button onClick={importRom}>
        <Icon src={diskette} /> &nbsp;Import a ROM file
      </Button>
      <Button disabled={alreadyExists} onClick={importSampleRom}>
        <Icon src={diskette} /> &nbsp;Import examples
      </Button>
      <Button link="/rom/new">
        <Icon src={newPackage} /> &nbsp;Create a new ROM
      </Button>
      <Button onClick={goToOptions}>
        <Icon src={cog} /> &nbsp;Options
      </Button>
    </MenuLike>
  )
}
