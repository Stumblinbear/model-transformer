/* eslint-disable @typescript-eslint/no-unused-vars */
import { Constructor } from "./types"

export type TransformResult<M> = M | null

export interface Transformer<K extends string, P, M, N> {
  version: K
  model: Constructor<M> | M

  /**
   * Called on `transform` to validate and remove unnecessary data from the model.
   *
   * @param model the model to sanitize
   * @returns the sanitized model
   */
  sanitize?(model: M): M

  /**
   * Takes in the model and returns the next version of the model, null if unsupported.
   *
   * @param model the model to upgrade
   * @returns the upgraded model
   */
  upgrade(model: M): TransformResult<N>

  /**
   * Takes in the model and returns the previous version of the model, null if unsupported.
   *
   * @param model the model to downgrade
   * @returns the downgraded model
   */
  downgrade(model: M): TransformResult<P>
}

export function Transformer<K extends string, P, M, N>(
  version: K,
  previous: Constructor<P> | P | null,
  current: Constructor<M> | M,
  next: Constructor<N> | N | null,
): Constructor<Transformer<K, P, M, N>> {
  return class implements Transformer<K, P, M, N> {
    version: K = version
    model: Constructor<M> | M = current

    upgrade(_: M): TransformResult<N> {
      return null
    }

    downgrade(_: M): TransformResult<P> {
      return null
    }
  }
}
