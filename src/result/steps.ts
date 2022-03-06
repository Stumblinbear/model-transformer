interface SanitizeStep {
  type: 'sanitize'
  version: string

  data: unknown
}

interface UpgradeStep {
  type: 'upgrade'
  version: string

  data: unknown
}

interface DowngradeStep {
  type: 'downgrade'
  version: string

  data: unknown
}

type Step = UpgradeStep | DowngradeStep | SanitizeStep

export type Steps = Step[]
