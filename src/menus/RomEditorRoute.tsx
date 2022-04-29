import { Navigate, useParams } from 'react-router-dom'
import RomEditor from '../components/RomEditor'
import RomProvider from '../components/RomProvider'

export default function RomEditorRoute() {
  const params = useParams()
  const id = Number(params.id)
  if (params.id == null || Number.isNaN(id)) {
    return <Navigate to="/" />
  }
  return <RomProvider id={id} map={rom => <RomEditor rom={rom} id={id} />} />
}
