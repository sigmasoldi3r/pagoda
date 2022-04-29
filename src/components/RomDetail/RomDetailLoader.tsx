import { useEffect } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import RomDetail from '.'
import { Rom, RomInfo } from '../../lib/storage/Rom'
import { t } from '../../lib/translate'
import useOptionState, { SetStateAction } from '../../lib/useOptionState'
import alert from '../Dialog/Alert'
import lock from '../Dialog/LockDialog'

type Update = React.Dispatch<SetStateAction<RomInfo>>

/** Loads the given ROM by ID. */
async function load(update: Update, id: number, navigate: NavigateFunction) {
  async function fail() {
    await alert(t`Couldn't load this rom.`)
    navigate(`/rom/list`)
  }
  const [close] = lock(t`Loading ROM details...`)
  try {
    const [info] = await Rom.fromDatabase(id)
    if (info == null) return await fail()
    update(info)
  } catch (err) {
    console.error(err)
    return await fail()
  } finally {
    close()
  }
}

/**
 * This component takes care of loading asynchronously all the ROM
 * data, in order to make the menu component stateless.
 */
export default function RomDetailLoader({ id }: { id: number }) {
  const [state, setState] = useOptionState<RomInfo>()
  const navigate = useNavigate()
  useEffect(() => {
    load(setState, id, navigate)
  }, [])
  return state.fold(<></>, info => <RomDetail info={info} id={id} />)
}
