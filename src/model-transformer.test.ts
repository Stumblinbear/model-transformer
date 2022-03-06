/* eslint-disable @typescript-eslint/no-unused-vars */
import { ModelTransformer, Transformer } from '.'

class GetRequestV1 {
  id: string
}

class GetRequestV2 {
  id?: string
  newField?: string
}

class GetRequestV3 {
  opt?: string
  newField?: string
}

class GetRequestV4 {
  newProp: number
}

class GetRequestV5 {
  testing: number
}

class GetRequestV1Transformer extends Transformer(
  '1',
  null,
  GetRequestV1,
  GetRequestV2,
) {
  upgrade(model: GetRequestV1): GetRequestV2 {
    return { id: model.id }
  }
}

class GetRequestV2Transformer extends Transformer(
  '2',
  GetRequestV1,
  GetRequestV2,
  GetRequestV3,
) {
  upgrade(model: GetRequestV2): GetRequestV3 {
    return {}
  }

  downgrade(model: GetRequestV2): GetRequestV1 | null {
    if (model.id) {
      return {
        id: model.id,
      }
    }

    return null
  }
}

class GetRequestV3Transformer extends Transformer(
  '3',
  GetRequestV2,
  GetRequestV3,
  GetRequestV4,
) {
  upgrade(model: GetRequestV3) {
    return { newProp: 0 }
  }

  downgrade(model: GetRequestV3): GetRequestV2 {
    return {}
  }
}

class GetRequestV4Transformer extends Transformer(
  '4',
  GetRequestV3,
  GetRequestV4,
  null,
) {
  sanitize(model: GetRequestV4) {
    return {
      newProp: Math.max(0, model.newProp),
    }
  }

  downgrade(model: GetRequestV4): GetRequestV3 {
    return {}
  }
}

class GetRequestV5Transformer extends Transformer('breaking_changes', null, GetRequestV5, null) {}

const STEPS = [
  new GetRequestV1Transformer(),
  new GetRequestV2Transformer(),
  new GetRequestV3Transformer(),
  new GetRequestV4Transformer(),
  new GetRequestV5Transformer(),
]

const getRequestTransformer = new ModelTransformer(STEPS)

describe('model transformer', () => {
  it('should sanitize the model', () => {
    const result = getRequestTransformer.transformFrom({ newProp: -1 }, '4', '4')

    expect(result.value).toEqual({ newProp: 0 })
  })

  describe('upgrading', () => {
    it('exactly one version', () => {
      const result = getRequestTransformer.transformFrom({ id: 'testing' }, '1', '2')

      expect(result.value).toEqual({ id: 'testing' })
    })

    it('through multiple versions', () => {
      const result = getRequestTransformer.transformFrom({ id: 'testing' }, '1', '4')

      expect(result.value).toEqual({ newProp: 0 })
    })

    it('should return an error when upgrading to an unsupported version', () => {
      const result = getRequestTransformer.transformFrom({ newProp: 1 }, '4', 'breaking_changes')

      expect(result).toMatchObject({ ok: false, error: 'upgrade_unsupported' })
    })
  })

  describe('downgrading', () => {
    it('exactly one version', () => {
      const result = getRequestTransformer.transformFrom({ newProp: 0 }, '4', '3')

      expect(result.value).toEqual({})
    })

    it('through multiple versions', () => {
      const result = getRequestTransformer.transformFrom({ newProp: 7 }, '4', '2')

      expect(result.value).toEqual({})
    })

    it('to an unsupported version returns an error', () => {
      const result = getRequestTransformer.transformFrom({}, '2', '1')

      expect(result).toMatchObject({ ok: false, error: 'downgrade_unsupported' })
    })

    it('to a conditionally supported version', () => {
      const result = getRequestTransformer.transformFrom({ id: '2' }, '2', '1')

      expect(result.value).toEqual({ id: '2' })
    })
  })
})
