import { none, option, some } from '@octantis/option'
import { useEffect, useState } from 'react'

let fallback = (
  <div>
    <span style={{ color: 'red' }}>Error: </span>The current navigation stack is
    empty.
  </div>
)
let update: option<React.Dispatch<React.SetStateAction<JSX.Element>>> = none()
const stack: JSX.Element[] = []

/**
 * Navigation wrapper.
 */
export class Nav {
  /** Pushes a new element into the navigation stack. */
  push(element: JSX.Element) {
    stack.push(element)
    this.update()
    console.log(`Going to ${stack.length}`, stack)
    window.history.pushState(
      { element: element.type.name, pos: stack.length - 1 },
      ''
    )
  }
  /** Clears the navigation stack, leaving the current element at top. */
  clear() {
    stack.splice(0, stack.length - 1)
  }
  /** Pops the stack one element. If no more items, it will go to fallback. */
  pop() {
    window.history.back()
    if (this.remaining <= 0) {
      stack.push(fallback)
    }
    const element = stack.pop()
    this.update()
    return element
  }
  /** Tells if the stack size. */
  get remaining() {
    return stack.length
  }
  // Navigation.
  private update() {
    for (const go of update) {
      go(stack[stack.length - 1])
    }
  }
}

export function useNav() {
  return new Nav()
}

function goBackPrevent(event: PopStateEvent) {
  if (event.state == null || event.state.pos === stack.length) {
    return console.warn('Forward navigation prevented.')
  }
  for (const upd of update) {
    stack.pop()
    upd(stack[stack.length - 1] ?? fallback)
  }
}

export default function NavProvider({ init }: { init: JSX.Element }) {
  const [current, setCurrent] = useState(init)
  useEffect(() => {
    fallback = init
    update = some(setCurrent)
    if (stack.length === 0) {
      new Nav().push(init)
    }
    window.addEventListener('popstate', goBackPrevent)
    return () => {
      window.removeEventListener('popstate', goBackPrevent)
      update = none()
    }
  }, [])
  return current
}
