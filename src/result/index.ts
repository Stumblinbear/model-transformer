export * from './steps'
export * from './errors'

export interface Ok<T> {
  ok: true
  value: T
}

export interface Err {
  ok: false
  value?: unknown
}

export type Result<T, E extends Err> = Ok<T> | E
