import { none, option, some } from '@octantis/option'
import { ReactElement, ReactNode } from 'react'
import { events, getKey } from '.'
import Button from '../Button'

export type SchemaDef = {
  [key: string]: Type | SchemaDef | string[]
}
export type SchemaResult<T extends SchemaDef> = {
  [K in keyof T]: K extends string
    ? T[K] extends Type
      ? TypeResult<T[K]>
      : T[K] extends SchemaDef
      ? SchemaResult<T[K]>
      : T[K] extends string[]
      ? T[K][number]
      : never
    : never
}

export type Type = 'string' | 'boolean' | 'number'
export type TypeResult<T extends Type> = T extends 'string'
  ? string
  : T extends 'boolean'
  ? boolean
  : T extends 'number'
  ? number
  : never

export type Future<A> = Promise<option<A>>

/**
 * Default prompt, asks for a string question.
 */
export function prompt<T extends undefined>(
  message: ReactElement | string,
  schema?: T
): Future<string>

/**
 * Prompts a single field of a simple type, like a
 * string, a number or a boolean.
 */
export function prompt<T extends Type>(
  message: ReactElement | string,
  schema: T
): Future<TypeResult<T>>

/**
 * Displays a confirmation prompt, always resolves to
 * either true or false.
 */
export function prompt<T extends string>(
  message: ReactElement | string,
  schema: 'boolean'
): Promise<boolean>

/**
 * Asks for a choice between various options (Dropdown).
 */
export function prompt<T extends string, U extends [T, ...T[]]>(
  message: ReactElement | string,
  schema: U
): Future<U[number]>

/**
 * Generates a complex form that satisfies the passed schema.
 */
export function prompt<T extends SchemaDef>(
  message: ReactElement | string,
  schema: T
): Future<SchemaResult<T>>

// Implementation.
export function prompt<T>(
  message: ReactElement | string,
  schema: any = 'string'
): any {
  if (schema === 'string') {
    return new Promise(r => {
      const key = getKey()
      let buffer = ''
      function done(value?: string) {
        events.emit('close', key)
        if (value == null) {
          r(none())
        } else {
          r(some(value))
        }
      }
      events.emit(
        'push',
        <Prompt accept={() => done(buffer)} cancel={() => done()} key={key}>
          <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            {message}
            <br />
            <input onChange={e => (buffer = e.target.value)} />
          </div>
        </Prompt>
      )
    })
  } else if (schema === 'number') {
    return new Promise(r => {
      const key = getKey()
      let last = 0
      function done(value?: number) {
        events.emit('close', key)
        if (value == null) {
          r(none())
        } else {
          r(some(value))
        }
      }
      events.emit(
        'push',
        <Prompt accept={() => done(last)} cancel={() => done()} key={key}>
          <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            {message}
            <br />
            <input
              type="number"
              onChange={e => (last = Number(e.target.value))}
            />
          </div>
        </Prompt>
      )
    })
  } else if (schema === 'boolean') {
    return new Promise(r => {
      const key = getKey()
      function done(value?: boolean) {
        events.emit('close', key)
        r(value)
      }
      events.emit(
        'push',
        <Prompt accept={() => done(true)} cancel={() => done(false)} key={key}>
          <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            {message}
          </div>
        </Prompt>
      )
    })
  }
  return Promise.resolve(none())
}

export function Prompt({
  children,
  accept,
  cancel,
}: {
  accept: () => void
  cancel: () => void
  children?: ReactNode
}) {
  return (
    <div className="dialog">
      <div className="dialog-content">{children}</div>
      <div className="dialog-footer">
        <Button onClick={accept}>Accept</Button>
        <Button onClick={cancel} variant="alert">
          Cancel
        </Button>
      </div>
    </div>
  )
}
