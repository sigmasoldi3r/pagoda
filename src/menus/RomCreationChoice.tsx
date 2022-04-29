import Button from '../components/Button'
import Icon from '../components/Icon'
import MenuLike from '../components/MenuLike'
import uploadFolderIcon from '../icons/upload_folder.png'
import createPackageIcon from '../icons/new_package.png'
import packageIcon from '../icons/package.png'
import uploadFile from '../components/FileUploader'
import lock from '../components/Dialog/LockDialog'
import alert from '../components/Dialog/Alert'
import { sleep } from '../lib/Coroutines'
import toml from 'toml'
import { Rom } from '../lib/storage/Rom'
import { useNavigate } from 'react-router-dom'

/** New ROM menu section. */
export default function RomCreationChoice() {
  const navigate = useNavigate()
  async function uploadRomFolder() {
    for (const folder of await uploadFile({ directory: true })) {
      const [done, update] = lock('Processing files...')
      const rom = new Rom()
      for (const file of folder) {
        await sleep(0)
        update(`Processing ${file.name}...`)
        if (file.name.toLowerCase() === 'meta.toml') {
          const data = await file.text()
          rom.meta = toml.parse(data)
        } else if (file.name.match(/\.pag(o(da)?)?$/i)) {
          rom.scripts[file.name.replace(/\.pag(o(da)?)?$/i, '')] =
            await file.text()
        }
      }
      const id = await rom.persist()
      done()
      await alert('Import complete!')
      navigate(`/rom/edit/${id}`)
    }
  }
  async function newAndEdit() {
    const [close] = lock(`Preparing ROM files...`)
    try {
      const rom = new Rom()
      const id = await rom.persist()
      navigate(`/rom/edit/${id}`)
    } finally {
      close()
    }
  }
  return (
    <MenuLike>
      <div style={{ textAlign: 'center' }}>
        <h1>New ROM</h1>
        <div style={{ marginTop: '0.1rem' }}>&nbsp;</div>
        <Icon src={packageIcon} />
        <div style={{ marginTop: '0.5rem' }}>&nbsp;</div>
      </div>
      <Button onClick={newAndEdit}>
        <Icon src={createPackageIcon} /> &nbsp;From scratch
      </Button>
      <Button onClick={uploadRomFolder}>
        <Icon src={uploadFolderIcon} /> &nbsp;Upload folder
      </Button>
    </MenuLike>
  )
}
