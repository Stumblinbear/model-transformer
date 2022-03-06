import type { ModelTransformerError, Result } from './result'
import type { Steps } from './result/steps'
import type { Transformer } from './transformer'
import type { AnyTransformer, Models } from './types'

/**
 * A transformer that can transform between any two versions of a model. Both upgrades and downgrades should be
 * implemented in a non-breaking way, no matter what version you're transforming from.
 */
export class ModelTransformer<V extends Models<I[number]>, I extends AnyTransformer[]> {
  protected order: Array<keyof V & string> = []
  protected transformers: {
    [version: string]: I[number]
  } = {}

  constructor(steps: I) {
    for (const step of steps) {
      this.order.push(step.version as keyof V & string)
      this.transformers[step.version] = step
    }
  }

  getTransformer<K extends keyof V & string>(
    version: K,
  ): Transformer<string, V[keyof V & string], V[K], V[keyof V & string]> | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.transformers[version] as any
  }

  /**
   * Transform a model from one version to another, providing you know the version you're coming from. If
   * you're not positive the data is in the proper format, you may run into undefined behavior and likely
   * errors.
   *
   * @param model The model to transform
   * @param from The version to transform from
   * @param to The version to transform to
   * @returns The transformed model
   */
  transformFrom<F extends keyof V & string, T extends keyof V & string>(
    model: V[F],
    from: F,
    to: T,
  ): Result<V[T], ModelTransformerError> {
    const start = this.order.indexOf(from)

    if (start === -1) {
      return { ok: false, error: 'from_invalid_version', from }
    }

    const end = this.order.indexOf(to)

    if (end === -1) {
      return { ok: false, error: 'to_invalid_version', to }
    }

    const steps: Steps = []

    let data: V[keyof V & string] = model

    const isUpgrade = start < end

    // We want to enter the loop on the version we're targeting so we don't have to duplicate the `sanitize` step afterwards
    for (let i = start; isUpgrade ? i <= end : i >= end; i += isUpgrade ? 1 : -1) {
      const version = this.order[i]

      const transformer = this.getTransformer(version)

      if(!transformer) {
        return { ok: false, error: 'unknown_transformer', version, steps }
      }

      // If the transformer has defined a sanitize step, we need to run it before transforming
      if (transformer.sanitize) {
        try {
          steps.push({
            type: 'sanitize',
            version,
            data,
          })

          data = transformer.sanitize(data)
        } catch (e: unknown) {
          return { ok: false, error: 'sanitize_failed', value: e, steps }
        }
      }

      // If we have not yet reached the version we want to transform to, transform it
      if (i !== end) {
        try {
          steps.push({
            type: isUpgrade ? 'upgrade' : 'downgrade',
            version,
            data,
          })

          const result = transformer[isUpgrade ? 'upgrade' : 'downgrade'](data)

          if (result === null) {
            return {
              ok: false,
              error: isUpgrade ? 'upgrade_unsupported' : 'downgrade_unsupported',
              steps,
            }
          }

          data = result
        } catch (e: unknown) {
          return { ok: false, error: 'transform_failed', value: e, steps }
        }
      }
    }

    return { ok: true, value: data as V[T] }
  }
}
