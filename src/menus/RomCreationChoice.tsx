import Button from '../components/Button'
import Icon from '../components/Icon'
import MenuLike from '../components/MenuLike'
import uploadFolderIcon from '../icons/upload_folder.png'
import createPackageIcon from '../icons/new_package.png'
import packageIcon from '../icons/package.png'
import { useNav } from '../components/Nav'
import RomEditor from './RomEditor'

export default function RomCreationChoice() {
  const nav = useNav()
  function createRom() {
    nav.push(<RomEditor />)
  }
  function uploadRomFolder() {}
  return (
    <MenuLike>
      <div style={{ textAlign: 'center' }}>
        <h1>New ROM</h1>
        <div style={{ marginTop: '0.1rem' }}>&nbsp;</div>
        <Icon src={packageIcon} />
        <div style={{ marginTop: '0.5rem' }}>&nbsp;</div>
      </div>
      <Button onClick={createRom}>
        <Icon src={createPackageIcon} /> &nbsp;From scratch
      </Button>
      <Button onClick={uploadRomFolder}>
        <Icon src={uploadFolderIcon} /> &nbsp;Upload folder
      </Button>
    </MenuLike>
  )
}
