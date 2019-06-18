import { error } from '#/utils/logger'
import produce from 'immer'
import { Nurse as API } from '#/services'


const REPORT_NAME = 'Nurse'

export default {

  namespace: `${REPORT_NAME}`,

  state: {
    assets: [],
    assetTotalCount: 0,
    assetsInMaintain: [],
    avgResponseTime: [],
  },

  reducers: {
    'set/assets'(state, { payload }) {
      return produce(state, state => {
        state.assets = payload.data
        state.assetTotalCount = payload.rowCount
      })
    },
    'set/assetsInMaintain'(state, { payload }) {
      return produce(state, state => {
        state.assetsInMaintain = payload
      })
    },
    'set/avgResponseTime'(state, { payload }) {
      return produce(state, state => {
        state.avgResponseTime = payload
      })
    },

  },

  effects: {
    *'get/all'({ }, { put }) {
      yield put({ type: 'get/assets' })
      yield put({ type: 'get/assetsInMaintain' })
      yield put({ type: 'get/avgResponseTime' })
    },
    *'get/assets'({ }, { put, call, select }) {
      let { data, rowCount } = yield call(API.getAssets)
      yield put({ type: 'set/assets', payload: { data, rowCount } })
    },
    *'get/assetsInMaintain'({ }, { put, call, select }) {
      let { data } = yield call(API.getAssetsInMaintain)
      yield put({ type: 'set/assetsInMaintain', payload: data })
    },
    *'get/avgResponseTime'({ }, { put, call, select }) {
      let { data } = yield call(API.getAvgResponseTime)
      yield put({ type: 'set/avgResponseTime', payload: data })
    }
  },

}
