import EventEmitter from 'events'

export type EventSchema = { [key: string]: (...args: any[]) => void }

export interface CustomEvents<T extends EventSchema>
  extends Omit<EventEmitter, 'emit' | 'on' | 'off' | 'once'> {
  on<K extends keyof T>(event: K, listener: T[K]): this
  once<K extends keyof T>(event: K, listener: T[K]): this
  off<K extends keyof T>(event: K, listener: T[K]): this
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void
}

export default function eventManager<T extends EventSchema>() {
  return new EventEmitter() as CustomEvents<T>
}
