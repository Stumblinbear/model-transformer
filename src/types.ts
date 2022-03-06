import type { Transformer } from './transformer'

export type Constructor<T = unknown> = new (...args: unknown[]) => T

type UnionToIntersection<U> = 
  (U extends unknown ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never

export type Models<D> = UnionToIntersection<
  D extends Transformer<infer K, unknown, infer M, unknown> ? { [P in K]: M } : never
>

export type OnlyRequired<T> = Pick<
  T,
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never
  }[keyof T]
>

export type VersionOf<D, T> = D extends unknown
  ? {
      [K in keyof D]: T extends OnlyRequired<D[K]> ? [K, T] : never
    }[keyof D]
  : never

export type AnyTransformer = Transformer<string, unknown, unknown, unknown>
