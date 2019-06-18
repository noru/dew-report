import moment from 'moment'
import { dateFormat } from '#/constants'
import { IsHead, getOrgId } from '#/utils'

const isHead = IsHead()
const orgId = getOrgId()

export default {
  namespace: 'filters',
  state: {
    type: 'history',
    from: moment().subtract(1, 'year').format(dateFormat),
    to: moment().format(dateFormat),
    groupBy: isHead ? 'dept' : 'type',
    data: []
  },
  effects: {
    *['data/change']({ payload, level }, { put, select }){
      yield put({
        type: 'profit/data/get',
        level
      })
      const type = yield select(state => state.filters.type)
      if (type !== 'history') {
        yield put({
          type: 'config/data/get',
          level
        })
      }
    },
    *['type/set']({ payload }, { put, select }) {
      if (payload === 'history') {
        yield put({
          type: 'range/set',
          payload: {
            from: moment().subtract(1, 'year').format(dateFormat),
            to: moment().subtract(1, 'day').format(dateFormat)
          }
        })
      } else {
        yield put({
          type: 'range/set',
          payload: {
            from: moment().startOf('year').format(dateFormat),
            to: moment().endOf('year').format(dateFormat)
          }
        })
      }
    },
    addWatcher: [ function* ({ takeLatest, put, call, select }) {
      const paload = yield takeLatest(
        [
          'filters/range/set',
          'filters/groupBy/set'
        ],
        function* (action) {
          yield put({
            type: 'data/reset'
          })
          yield put({
            type: 'profit/data/get',
            level: 0
          })
          const type = yield select(state => state.filters.type)
          if (type !== 'history') {
            yield put({
              type: 'config/changes/reset'
            })
            yield put({
              type: 'config/data/get',
              level: 0
            })
          }
        }
      )
    }, { type: 'watcher'}]
  },
  reducers: {
    ['data/reset'](state) {
      return {
        ...state,
        data: []
      }
    },
    ['data/change'](state, { payload, level }) {
      const data = state.data
      data[level] = payload
      return {
        ...state,
        data: data.slice(0, level + 1)
      }
    },
    ['type/set'](state, { payload }) {
      return {
        ...state,
        type: payload
      }
    },
    ['range/set'](state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    ['groupBy/set'](state, { payload }) {
      return {
        ...state,
        groupBy: payload
      }
    }
  }
}
