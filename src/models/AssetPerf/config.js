/* @flow */
import { round, isFocusNode } from '#/utils'
import axios from 'axios'
import { pickBy } from 'lodash'
import { API_HOST } from '#/constants'
import { IsHead, getOrgId } from '#/utils'

const isHead = IsHead()
const orgId = getOrgId()

export default {
  namespace: 'config',
  state: {
    loading: false,
    data: [],
    changes: []
  },
  subscriptions: {
  },
  effects: {
    *['data/get']({ payload, level }, { put, call, select }) {
      try {
        const filters = yield select(state => state.filters)

        const { type, groupBy, from, to, data: filtersData } = filters

        if (type === 'history') return

        const filter = filtersData[level]

        const { data } = yield axios({
          method: 'get',
          url: API_HOST + '/profit/forecastrate',
          params: pickBy({
            groupby: filter ? null : groupBy,
            from,
            to,
            dept: orgId,
            ...filter
          })
        })
        yield put({
          type: 'data/get/succeeded',
          payload: data,
          level
        })
      } catch(err) {
        console.error(err)
      }
    },
    *['changes/submit']({ resolve, reject } , { put, take, call, select }) {
      yield put({
        type: 'profit/data/get',
        level: 0
      })
      yield take(action => action.type === 'profit/data/get/succeeded' && action.level === 0)
      yield put({
        type: 'profit/data/get',
        level: 1
      })
    },
    // *['data/set'] ({ payload }, { put, call, select }) {
    //   try {
    //     yield put({
    //       type: 'data/set/succeed',
    //       payload: payload
    //     })
    //   } catch (err) {
    //   }
    // },
    // *['changes'] ({ payload }, { put, call, select }) {
    //   try {
    //     yield put({
    //       type: 'changes/succeed',
    //       payload
    //     })
    //
    //   } catch (err) {
    //
    //   }
    // }
  },
  reducers: {
    ['changes/reset'](state){
      return {
        ...state,
        changes: []
      }
    },
    ['data/get'](state) {
      return {
        ...state,
        loading: true
      }
    },
    ['data/get/succeeded'](state, { payload, level }) {
      const data = [...state.data]
      data[level] = payload.items

      return {
        ...state,
        data: data.slice(0, level + 1),
        loading: false
      }
    },
    ['changes'] (state, { payload, filter }) {
      const changes = state.changes
      const index = changes.findIndex(datum => {
        return payload.id === datum.type && Object.entries(filter).reduce((prev, [k, v]) => prev && datum[k] === v, true)
      })
      if (index >= 0) {
        changes[index] = {...changes[index]}
        changes[index].revenue_rate = payload.revenue_increase
        changes[index].cost_rate = payload.cost_increase
        return {
          ...state,
          changes: [...changes]
        }
      } else {
        return {
          ...state,
          changes: changes.concat([{
            type: payload.id,
            ...filter,
            revenue_rate: payload.revenue_increase,
            cost_rate: payload.cost_increase
          }])
        }
      }
    },
    // ['changes/succeed'] (state, { payload }) {
    //   const { cursor: [ id ] } = payload
    //
    //   return {
    //     ...state,
    //     changes: {
    //       ...state.changes,
    //       [id]: {
    //         ...(state.changes[id] || {}),
    //         ...payload
    //       }
    //     }
    //   }
    // },
    // ['changes/reset'] (state, { payload }) {
    //   return {
    //     ...state,
    //     changes: {}
    //   }
    // },
    // // ['data/set/succeed'] (state, { payload }) {
    // //   return {
    // //     ...state,
    // //     data: payload
    // //   }
    // // },
    // ['loading/on'] (state, action) {
    //   return {
    //     ...state,
    //     loading: true
    //   }
    // },
    // ['loading/off'] (state, action) {
    //   return {
    //     ...state,
    //     loading: false
    //   }
    // }
  }
}

function getConfig (nodes) {
  const root = nodes[0]
  const { depth, height } = root
  return nodes
  .filter(n => !~[depth, height].indexOf(n.depth))
}

function pickUpFields (obj) {
  return {
    depth: obj.depth,
    height: obj.height,
    id: obj.data.id,
    uid: obj.data.uid,
    name: obj.data.name,
    // for the display usage # 1 hard code OMG !!!!!
    change: round(obj.data.usage_predict * 100, 1),
    usage_min: obj.data.usage_threshold ? obj.data.usage_threshold[0] * 100 : '',
    usage_max: obj.data.usage_threshold ? obj.data.usage_threshold[1] * 100 : ''
  }
}
