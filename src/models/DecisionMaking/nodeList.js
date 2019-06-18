import * as d3 from 'd3-hierarchy'
const childKey = 'items'

export default {
  namespace: 'nodeList',
  state: {
    loading: false,
    data: [],
    coefficient: {
      diameter: undefined,
      margin: undefined
    }
  },
  effects: {
    *['coefficient/set'] ({ payload }, { put }) {
      const { diameter, margin } = payload
      yield put({
        type: 'coefficient/set/succeed',
        payload: payload
      })
    },
    *['data/get'] ({ payload }, { put, select, call, take }) {
      try {
        let { coefficient } = yield select(state => state.nodeList)
        if (!coefficient.diameter) {
          const action = yield take('nodeList/coefficient/set/succeed')
          coefficient = action.payload
        }

        const { diameter, margin } = coefficient

        const nodes = getNodes(payload, diameter, margin)

        yield put({
          type: 'data/get/succeed',
          payload: nodes
        })

        // set root as cursor when cursor is empty
        const { cursor } = yield select(state => state.DecisionMaking_focus)
        if (!cursor.length) {
          const { depth, data: { id }} = nodes[0]
          yield put({
            type: 'DecisionMaking_focus/cursor/set',
            payload: [ id, depth ]
          })
        }
      } catch (err) {
      }
    }
  },
  reducers: {
    ['coefficient/set/succeed'] (state, { payload }) {
      return {
        ...state,
        coefficient: {
          ...state.coefficient,
          ...payload
        }
      }
    },
    ['data/get/succeed'] (state, { payload }) {
      return {
        ...state,
        data: payload
      }
    }
  }
}

function getNodes (data: Object, diameter: number, margin: number) {
  const pack = d3.pack()
  .size([diameter - margin, diameter - margin])
  .padding(2)

  const root = d3.hierarchy(data, d => d[childKey])
  .sum(d => d.size + .1) // sizeKey hard code here. YHAAO-178, if size == 0
  .sort((a, b) => b.value - a.value)

  const nodes = pack(root).descendants()
  return nodes
}
