import { useEffect } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import lock from '../components/Dialog/LockDialog'
import { Rom } from './storage/Rom'
import useOptionState, { SetStateAction } from './useOptionState'

type Update = React.Dispatch<SetStateAction<Rom>>

export async function load(
  update: Update,
  id: number,
  navigate: NavigateFunction
) {
  const [close] = lock(`Loading your ROM...`)
  try {
    const [info] = await Rom.fromDatabase(id)
    if (info == null) {
      await alert(`Could not load the ROM #${id}!`)
      navigate(-1)
    }
    const rom = Rom.decode(info.data)
    update(rom)
  } catch (err) {
    console.error(err)
    await alert(`There was an error while fetching the ROM.`)
    navigate(-1)
  } finally {
    close()
  }
}

export default function useRomLoader(id: number) {
  const navigate = useNavigate()
  const [rom, setRom] = useOptionState<Rom>()
  useEffect(() => {
    load(setRom, id, navigate)
  }, [])
  return rom
}
