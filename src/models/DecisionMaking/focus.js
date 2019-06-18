import { isSameCursor } from '#/utils'

export default {
  namespace: 'DecisionMaking_focus',
  state: {
    loading: false,
    node: undefined,
    cursor: []
  },
  subscriptions: {
    setup ({ dispatch }) {
    }
  },
  effects: {
    *['cursor/set'] ({ payload }, { put, call, select }) {
      // should we validate the cursor is correct ?
      yield put({
        type: 'cursor/set/succeed',
        payload
      })

      yield put({ type: 'node/set' })
    },
    *['node/set'] ({ payload }, { take, select, put }) {
      try {
        let { cursor } = yield select(state => state.DecisionMaking_focus)
        if (!cursor) {
          const action = yield take('cursor/set/succeed')
          cursor = action.payload
        }

        const [ id, depth ] = cursor

        const nodeList = yield select(state => state.nodeList.data)
        const target = nodeList.find(n => n.data.id === id && n.depth === depth)
        if (target) {
          yield put({
            type: 'node/set/succeed',
            payload: target
          })
        }
      } catch (err) {
      }
    }
  },
  reducers: {
    ['cursor/set/succeed'] (state, { payload }) {
      if (isSameCursor(payload, state.cursor)) return state
      return {
        ...state,
        cursor: payload
      }
    },
    ['cursor/reset'] (state, { payload }) {
      return {
        ...state,
        cursor: []
      }
    },
    ['node/set/succeed'] (state, { payload }) {
      if (payload === state.node) return state
      return {
        ...state,
        node: payload
      }
    },
    ['loading/on'] (state, action) {
      return {
        ...state,
        loading: true
      }
    },
    ['loading/off'] (state, action) {
      return {
        ...state,
        loading: false
      }
    }
  }
}
