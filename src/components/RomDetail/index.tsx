import { Rom, RomInfo } from '../../lib/storage/Rom'
import * as db from '../../lib/storage/database'
import Button from '../Button'
import Icon from '../Icon'
import diskette from '../../icons/diskette.png'
import pen from '../../icons/pen.png'
import trash from '../../icons/trash.png'
import download from '../../icons/download.png'
import { prompt } from '../Dialog'
import { useNavigate } from 'react-router-dom'
import RomDetailLoader from './RomDetailLoader'

// A simple menu with the details of the ROM.
// In the future this will contain splash art and such.
export default function RomDetail({ info, id }: { id: number; info: RomInfo }) {
  const navigate = useNavigate()
  async function goToRom() {
    navigate(`/rom/run/${id}`)
  }
  async function editRom() {
    navigate(`/rom/edit/${id}`)
  }
  async function deleteRom() {
    if (await prompt(`Are you sure you want to delete this ROM?`, 'boolean')) {
      await db.roms.delete({ id })
      navigate(`/rom/list`)
    }
  }
  async function downloadRom() {
    Rom.decode(info.data, id).downloadAsFile()
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
      <Button onClick={() => navigate('/rom/list')} size="small">
        Back
      </Button>
    </div>
  )
}
RomDetail.Loader = RomDetailLoader
