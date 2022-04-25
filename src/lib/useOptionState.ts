import { none, option, some } from '@octantis/option'
import { useState } from 'react'

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
    (value: A) => setState(() => some(value)),
    () => setState(() => none()),
    setState,
  ] as const
}
