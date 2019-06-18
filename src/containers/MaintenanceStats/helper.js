import { COMPLETION, QUALITY, purple, prasinous, gray } from '#/constants'

export function formatData (data) {
  return data.map(n => {
    const { key, val } = n

    const completePercent = val[COMPLETION].completed / val[COMPLETION].all
    const qualityPercent = val[QUALITY].repair / val[QUALITY].all

    return {
      id: key.id,
      name: key.name,
      origin: {
        ...n.key,
        ...n.val
      },
      [COMPLETION]: [
        {
          color: purple,
          value: completePercent
        },
        {
          color: gray,
          value: 1 - completePercent
        }
      ],
      [QUALITY]: [
        {
          color: prasinous,
          value: qualityPercent
        },
        {
          color: gray,
          value: 1 - qualityPercent
        }     
      ]
    }
  })
}
