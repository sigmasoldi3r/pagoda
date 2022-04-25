import { none, option, some } from '@octantis/option'
import { useState } from 'react'

export type SetStateAction<A> = ((prev: option<A>) => A) | A
export type ResetStateAction<A> = void | ((prev: option<A>) => void)

export function isDispatch<R>(
  value: SetStateAction<R>
): value is (prev: option<R>) => R {
  return typeof value === 'function'
}

export function isReset<R>(
  value: ResetStateAction<R>
): value is (prev: option<R>) => void {
  return typeof value === 'function'
}

/**
 * Creates a state that is of type option<A> automatically,
 * and returns two additional mutator functions: setState which
 * will always set the state to Some<A>, and resetState which
 * will always set the state to None. Also the raw setState
 * action is passed as 4th argument, in case that is needed.
 */
export default function useOptionState<A>(...initial: [A] | []) {
  const init: option<A> = initial.length === 1 ? some(initial[0]) : none()
  const [state, setState] = useState<option<A>>(init)
  return [
    state,
    ((value: SetStateAction<A>) => {
      if (isDispatch(value)) {
        setState(prev => some(value(prev)))
      } else {
        setState(() => some(value))
      }
    }) as React.Dispatch<SetStateAction<A>>,
    ((value?: ResetStateAction<A>) => {
      if (isReset(value)) {
        setState(prev => {
          value(prev)
          return none()
        })
      } else {
        setState(() => none())
      }
    }) as React.Dispatch<ResetStateAction<A>>,
    setState,
  ] as const
}
