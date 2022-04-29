import { Navigate, useParams } from 'react-router-dom'
import RomProvider from '../components/RomProvider'
import Stage from '../components/Stage'

export default function StageRoute() {
  const params = useParams()
  const id = Number(params.id)
  if (params.id == null || Number.isNaN(id)) {
    return <Navigate to="/" />
  }
  return <RomProvider id={id} map={rom => <Stage rom={rom} />} />
}
