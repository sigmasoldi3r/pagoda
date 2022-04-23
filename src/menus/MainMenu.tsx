import Button from '../components/Button'
import diskette from '../icons/diskette.png'
import folder from '../icons/folder.png'
import cog from '../icons/cog_wheel.png'
import newPackage from '../icons/new_package.png'
import pagodaLogo from '../logo.png'
import Icon from '../components/Icon'
import { useScreen } from '../components/Screen'
import RomList from './RomList'

// Main menu component.
export default function MainMenu() {
  const go = useScreen()
  function openRom() {
    go(<RomList />)
  }
  function importRom() {}
  function createRom() {}
  function goToOptions() {}
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icon
            imgStyle={{ left: 'calc(-32px + 16px/2 - 1px)' }}
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
        <Button onClick={createRom}>
          <Icon src={newPackage} /> &nbsp;Create a new ROM
        </Button>
        <Button onClick={goToOptions}>
          <Icon src={cog} /> &nbsp;Options
        </Button>
      </div>
    </div>
  )
}
