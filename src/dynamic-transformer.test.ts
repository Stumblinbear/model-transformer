import { DynamicModelTransformer, Transformer } from '.'

class GetRequestV1 {
  id: string
}

class GetRequestV2 {
  newId: string
}

class GetRequestV1Transformer extends Transformer(
  '1',
  null,
  GetRequestV1,
  GetRequestV2,
) {
  upgrade(model: GetRequestV1): GetRequestV2 {
    return { newId: model.id }
  }
}

class GetRequestV2Transformer extends Transformer(
  '2',
  GetRequestV1,
  GetRequestV2,
  null,
) {
  downgrade(model: GetRequestV2): GetRequestV1 | null {
    return {
      id: model.newId,
    }
  }
}

export const STEPS = [
  new GetRequestV1Transformer(),
  new GetRequestV2Transformer()
]

const getRequestTransformer = new DynamicModelTransformer(STEPS, data => {
  if ('id' in data) {
    return ['1', data]
  }

  return ['2', data]
})

describe('dynamic transformer', () => {
  let transformFromSpy: jest.SpyInstance

  beforeEach(() => {
    transformFromSpy = jest
      .spyOn(getRequestTransformer, 'transformFrom')
      .mockReturnValue({ ok: true, value: { id: '' } })
  })

  afterEach(() => {
    transformFromSpy.mockRestore()
  })

  it('should detect the version', () => {
    const v1 = getRequestTransformer.getVersionOf({ id: 'something' })

    expect(v1.value).toEqual(expect.arrayContaining(['1']))

    const v2 = getRequestTransformer.getVersionOf({ newId: 'something' })

    expect(v2.value).toEqual(expect.arrayContaining(['2']))
  })

  it('should call `transformFrom` using the version', () => {
    getRequestTransformer.transform({ newId: '1222ede' }, '1')

    expect(transformFromSpy).toHaveBeenCalledWith(
      expect.anything(),
      '2',
      '1',
    )
  })
})
