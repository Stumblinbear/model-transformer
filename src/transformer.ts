/* eslint-disable @typescript-eslint/no-unused-vars */
import { Constructor } from "./types"

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
  upgrade(model: M): N | null

  /**
   * Takes in the model and returns the previous version of the model, null if unsupported.
   *
   * @param model the model to downgrade
   * @returns the downgraded model
   */
  downgrade(model: M): P | null
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

    upgrade(_: M): N | null {
      return null
    }

    downgrade(_: M): P | null {
      return null
    }
  }
}
