import { Navigate, useParams } from 'react-router-dom'
import RomDetail from '../components/RomDetail'

/** ROM Details menu. */
export default function RomDetails() {
  const params = useParams()
  const id = Number(params.id)
  if (params.id == null || Number.isNaN(id)) {
    return <Navigate to="/rom/list" />
  }
  return <RomDetail.Loader id={id} /> // Spawn the loader if the ID is valid.
}
