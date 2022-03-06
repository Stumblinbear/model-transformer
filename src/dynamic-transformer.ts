import { ModelTransformer } from './model-transformer'
import type { DetectionError, DynamicTransformError, Result } from './result'
import type { AnyTransformer, Models, VersionOf } from './types'

export class DynamicModelTransformer<
  V extends Models<I[number]>,
  I extends AnyTransformer[]
> extends ModelTransformer<V, I> {
  private versionOf?: (
    data: V[keyof V & string],
  ) => Result<VersionOf<V, V[keyof V & string]>, DetectionError> | VersionOf<V, V[keyof V & string]>

  constructor(
    steps: I,
    versionOf?: (
      data: V[keyof V & string],
    ) =>
      | Result<VersionOf<V, V[keyof V & string]>, DetectionError>
      | VersionOf<V, V[keyof V & string]>,
  ) {
    super(steps)

    this.versionOf = versionOf
  }

  /**
   * Transform a model from one version to another, if you do not know the exact version you're coming from. This
   * method will attempt to find the most appropriate version to transform from.
   *
   * This will modify the original object.
   *
   * @param model The model to transform
   * @param to The version to transform to
   * @returns The transformed model
   */
  transform<M extends V[keyof V & string], T extends keyof V & string>(
    model: M,
    to: T,
  ): Result<V[T], DynamicTransformError> {
    const matched = this.getVersionOf(model)

    if (!matched.ok) {
      return matched
    }

    return this.transformFrom(model, matched.value[0] as keyof V & string, to)
  }

  getVersionOf<D extends V[keyof V & string]>(
    data: D,
  ): Result<VersionOf<V, V[keyof V & string]>, DetectionError> {
    // Since the transformers have references to the model prototype, we can short circuit
    // the search by checking any instance matches. However, due to how `instanceof` works,
    // we can't do so if two transformers share a model (through subclassing).

    const instanceMatches = Object.entries(this.transformers)
      .filter(([, { model }]) => typeof model === 'function' && data instanceof model)
      .map(([version]) => version)

    if (instanceMatches.length === 1) {
      return {
        ok: true,
        value: [instanceMatches[0], data as unknown] as VersionOf<V, V[keyof V & string]>,
      }
    }

    // We cannot bail on 0 matches, since the input may be raw data, rather than an instance

    return this.detectVersionOf(data)
  }

  /**
   * This method should return the most appropriate version of a model, if one exists.
   *
   * Should return `[version, model]` of the most appropriate version, or an error if no version is found.
   * The returned `model` is only required to give proper type errors, and should not be modified.
   */
  detectVersionOf<D extends V[keyof V & string]>(
    data: D,
  ): Result<VersionOf<V, V[keyof V & string]>, DetectionError> {
    if (!this.versionOf) return { ok: false, error: 'unknown_version' }

    const result = this.versionOf(data)

    if ('ok' in result) {
      return result
    }

    return {
      ok: true,
      value: result,
    }
  }
}
