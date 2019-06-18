/* @flow */
import { round, isFocusNode } from '#/utils'

export default {
  namespace: 'DecisionMaking_config',
  state: {
    loading: false,
    data: undefined,
    changes: {}
  },
  subscriptions: {
    setup ({ dispatch }) {
    }
  },
  effects: {
    *['data/set'] ({ payload }, { put, call, select }) {
      try {
        yield put({
          type: 'data/set/succeed',
          payload: payload
        })
      } catch (err) {
      }
    },
    *['changes'] ({ payload }, { put, call, select }) {
      try {
        yield put({
          type: 'changes/succeed',
          payload
        })

        yield put({
          type: 'data/update/item',
          payload
        })
      } catch (err) {

      }
    },
    *['changes/submit'] ({ payload, resolve, reject }, { put, call, select, take }) {
      try {
        yield put({ type: 'loading/on' })
        /**
         * todo:
         * Is it possible that API only need the changed part instead of threshold
         */
        const { changes, data: configList } = yield select(state => state.DecisionMaking_config)

        const datum = Object.keys(changes).reduce((prev, cur) => {
          const item = changes[cur]
          const { cursor, increase, max, min } = item
          const configTarget = configList.find(n => isFocusNode(n, cursor))
          const { children } = configTarget

          const changedOne = {
            id: cur,
            children: Array.isArray(children) ? children.map(n => n.data.id) : []
          }

          if (increase) changedOne.change = increase

          if (max || min) {
            changedOne.threshold =  [
              min || configTarget.data.usage_threshold[0],
              max || configTarget.data.usage_threshold[1]
            ]
          }

          prev.push(changedOne)
          return prev
        }, [])
        .filter(n => Array.isArray(n.children))
        .map(n => {
          const { id, children, ...otherProps } = n
          return children.map(id => ({
            id,
            ...otherProps
          }))
        })

        const body = [].concat.apply([], datum)

        yield put({
          type: 'finance/data/put',
          payload: body
        })

        yield take('DecisionMaking_config/data/set/succeed')

        yield put({ type: 'loading/off' })
        resolve && resolve()
      } catch (err) {
        reject && reject()
      }
    }
  },
  reducers: {
    ['changes/succeed'] (state, { payload }) {
      const { cursor: [ id ] } = payload

      return {
        ...state,
        changes: {
          ...state.changes,
          [id]: {
            ...(state.changes[id] || {}),
            ...payload
          }
        }
      }
    },
    ['changes/reset'] (state, { payload }) {
      return {
        ...state,
        changes: {}
      }
    },
    ['data/update/item'] (state, { payload }) {
      const { cursor, ...restPart } = payload

      const newData = state.data.map(n => {
        if (isFocusNode(n, cursor)) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updatePart(n.data, restPart)
            }
          }
        }
        return n
      })

      return {
        ...state,
        data: [...newData]
      }
    },
    ['data/set/succeed'] (state, { payload }) {
      return {
        ...state,
        data: payload
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

function updatePart (node, props) {
  let result = {}
  const tmp = Object.entries(props)
  if (Array.isArray(tmp) && tmp.length) {
    const [key, value] = tmp[0]
    if (key === 'increase') result = {usage_predict_increase: value}
    if (key === 'max') result = {usage_threshold: [node.usage_threshold[0], value]}
    if (key === 'min') result = {usage_threshold: [value, node.usage_threshold[1]]}
  }
  return result
}
