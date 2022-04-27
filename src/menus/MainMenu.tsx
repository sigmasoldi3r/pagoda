import Button from '../components/Button'
import diskette from '../icons/diskette.png'
import folder from '../icons/folder.png'
import cog from '../icons/cog_wheel.png'
import newPackage from '../icons/new_package.png'
import pagodaLogo from '../logo.png'
import Icon from '../components/Icon'
import { useNav } from '../components/Nav'
import RomList from './RomList'
import * as builtins from '../roms'
import * as db from '../lib/storage/database'
import { useEffect, useState } from 'react'
import MenuLike from '../components/MenuLike'
import RomCreationChoice from './RomCreationChoice'
import uploadFile from '../components/FileUploader'
import { prompt } from '../components/Dialog'
import alert from '../components/Dialog/Alert'

// Main menu component.
export default function MainMenu() {
  const [locked, setLocked] = useState(false)
  const [alreadyExists, setAlreadyExists] = useState(true)
  useEffect(() => {
    db.roms.getAll().then(all => {
      const one = all.find(row => row.name === builtins.testing.name)
      if (one == null) {
        setAlreadyExists(false)
      }
    })
  }, [])
  const nav = useNav()
  function openRom() {
    nav.push(<RomList />)
  }
  async function importRom() {
    for (const files of await uploadFile({ directory: true })) {
      console.log(files[0])
    }
  }
  async function createRom() {
    nav.push(<RomCreationChoice />)
  }
  async function goToOptions() {}
  async function importSampleRom() {
    setLocked(true)
    const rom = builtins.testing
    const binary = rom.encode()
    await db.roms.add({
      name: rom.name,
      data: binary,
    })
    console.log('Done!')
    setAlreadyExists(true)
    db.roms.consoleTable()
    setLocked(false)
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
      <Button disabled={locked} onClick={openRom}>
        <Icon src={folder} /> &nbsp;Open a ROM
      </Button>
      <Button disabled={locked} onClick={importRom}>
        <Icon src={diskette} /> &nbsp;Import a ROM file
      </Button>
      <Button disabled={alreadyExists || locked} onClick={importSampleRom}>
        <Icon src={diskette} /> &nbsp;Import examples
      </Button>
      <Button disabled={locked} onClick={createRom}>
        <Icon src={newPackage} /> &nbsp;Create a new ROM
      </Button>
      <Button disabled={locked} onClick={goToOptions}>
        <Icon src={cog} /> &nbsp;Options
      </Button>
    </MenuLike>
  )
}
