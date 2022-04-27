import { ReactElement } from 'react'
import { events, getKey } from '.'

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

/**
 * Default prompt, asks for a string question.
 */
export function ask<T extends undefined>(
  message: ReactElement | string,
  schema?: T
): Promise<string>

/**
 * Prompts a single field of a simple type, like a
 * string, a number or a boolean.
 */
export function ask<T extends Type>(
  message: ReactElement | string,
  schema: T
): Promise<TypeResult<T>>

/**
 * Asks for a choice between various options (Dropdown).
 */
export function ask<T extends string, U extends [T, ...T[]]>(
  message: ReactElement | string,
  schema: U
): Promise<U[number]>

/**
 * Generates a complex form that satisfies the passed schema.
 */
export function ask<T extends SchemaDef>(
  message: ReactElement | string,
  schema: T
): Promise<SchemaResult<T>>

// Implementation.
export function ask<T>(
  message: ReactElement | string,
  schema: any = 'string'
): Promise<any> {
  if (typeof schema === 'string') {
    return new Promise(r => {
      const key = getKey()
      events.emit(
        'push',
        <div key={key}>
          This is a test dialog.
          <p>message = {message}</p>
          <button
            onClick={() => {
              ask(`${message}.`)
            }}
          >
            Push one
          </button>
          <button
            onClick={() => {
              events.emit('close', key)
              r('Yer closerand.')
            }}
          >
            Close me.
          </button>
        </div>
      )
    })
  }
  return Promise.resolve(null)
}
