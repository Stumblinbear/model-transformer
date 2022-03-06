import type { Err, Steps } from '.'

interface WithSteps extends Err {
  steps: Steps
}

interface FromInvalidVersion extends Err {
  error: 'from_invalid_version'
  from: string
}

interface ToInvalidVersion extends Err {
  error: 'to_invalid_version'
  to: string
}

interface SanitizeFailed extends Err {
  error: 'sanitize_failed'
  value: unknown
}

interface UpgradeUnsupported extends Err {
  error: 'upgrade_unsupported'
}

interface DowngradeUnsupported extends Err {
  error: 'downgrade_unsupported'
}

interface UnknownTransformer extends Err {
  error: 'unknown_transformer'
  version: string
}

interface TransformFailed extends Err {
  error: 'transform_failed'
  value: unknown
}

export type TransformError = UpgradeUnsupported | DowngradeUnsupported | UnknownTransformer | TransformFailed

export type ModelTransformerError =
  | FromInvalidVersion
  | ToInvalidVersion
  | (SanitizeFailed & WithSteps)
  | (TransformError & WithSteps)

interface UnknownVersion extends Err {
  error: 'unknown_version'
}

export type DetectionError = UnknownVersion

export type DynamicTransformError = ModelTransformerError | UnknownVersion
