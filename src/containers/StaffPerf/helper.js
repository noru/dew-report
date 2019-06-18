import { ORDER, HOUR, RATE } from '#/constants'

export function formatData (data, range) {
  const result = data.map(n => {
    const { owner_id, owner_name, man_hour } = n

    const hours = ['repair', 'maintenance', 'meter', 'inspection']
    .map(c => n[c] / man_hour)

    const rates = ['score'].map(c => n[c] / range.score)

    const orders = ['closed', 'open'].map(c => n[c] / range.work_order)

    return {
      id: owner_id,
      name: owner_name,
      [HOUR]: hours,
      [RATE]: rates,
      [ORDER]: orders,
      data: n
    }
  })

  return result
}
