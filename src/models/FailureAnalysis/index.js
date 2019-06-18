import { cloneDeep } from 'lodash-es'
import { FailureAnalysis as API } from '#/services'
import { error } from '#/utils/logger'
import EventBus from 'eventbusjs'
import moment from 'moment'

const REPORT_NAME = 'FailureAnalysis'

export default {

  namespace: `${REPORT_NAME}`,

  state: {
    filterBy: {
      assettype: 'all_asset_type',
      dept: 'all_dept',
      hospital: 'default_hospital',
      supplier: 'all_supplier', // currently no dropdown on UI
    },
    period: {
      from: moment(new Date().getFullYear(), 'YYYY'),
      to: moment()
    },
    dataType: 'operation_rate',
    showLastYear: false,
    display: 'display_asset_type', // type | brand | name
    pagination: {
      left: {
        skip: 0,
        top: 6,
        total: 0,
      },
      right: {
        skip: 0,
        top: 16,
        total: 0
      }
    },
  },

  reducers: {

    ['update/filter'](state, { data }) {
      state = cloneDeep(state)
      state.filterBy[data.type] = data.data.key
      return state
    },

    ['update/period'](state, { data }) {
      state = cloneDeep(state)
      state.period = {
        from: data[0],
        to: data[1]
      }
      return state
    },

    ['update/datatype'](state, { data }) {
      state = cloneDeep(state)
      state.dataType = data
      return state
    },

    ['update/showlastyear'](state, { data }) {
      state = cloneDeep(state)
      state.showLastYear = data
      return state
    },

    ['update/display'](state, { data }) {
      state = cloneDeep(state)
      state.display = data
      return state
    },

    ['update/pagination/sync'](state, { data }) {
      state = cloneDeep(state)
      let pag = state.pagination[data.type]
      Object.assign(pag, data.value)
      return state
    }

  },

  effects: {
    *['get/all'](action, { put }) {
      yield put({ type: 'get/briefs', data: { chart: 'left' } })
      yield put({ type: 'get/briefs', data: { chart: 'right' } })
      yield put({ type: 'get/reasons', data: {} })
    },

    *['get/reasons'](action, { call, select }) {
      try {
        let params = yield select(state => ({ ...state.FailureAnalysis, hospital: state.depts.selectedHospital }))
        let reasons = yield call(API.getReasons, params, action.data)
        EventBus.dispatch('failure-analysis-reason-data', reasons)
      } catch (e) {
        error(e)
      }
    },

    *['get/briefs'](action, { put, select, call }) {
      let type = action.data.chart
      let targetPage = action.data.value
      try {
        let params = yield select(state => ({ ...state.FailureAnalysis, hospital: state.depts.selectedHospital }))
        params = cloneDeep(params)
        let pag = params.pagination[type]
        if (targetPage) {
          pag.skip = (targetPage - 1) * pag.top
        } else {
          pag.skip = 0
        }
        let extraParam = action.data || {}
        if ('type' in extraParam) {
          params.filterBy.assettype = extraParam['type']
        } else if ('dept' in extraParam) {
          params.filterBy.dept = extraParam['dept']
        } else if ('supplier' in extraParam) {
          params.filterBy.supplier = extraParam['supplier']
        }
        let briefs = yield call(API.getBriefs, type, params)

        briefs.type = type
        let lastYear = undefined
        if (params.showLastYear) {
          params.keys = briefs.map(_ => _.data.key.id).join(',')
          lastYear = yield call(API.getBriefs, type, params, true)
          lastYear.type = type
        }

        let value = {
          total: briefs.pages.total,
          skip: briefs.pages.start,
        }
        yield put({ type: 'update/pagination/sync', data: { type, value } })
        EventBus.dispatch('failure-analysis-brief-data', [ briefs, lastYear ])
      } catch (e) {
        error(e)
      }
    },

    paramWatcher: [
      function*({ takeLatest, put }) {
        yield takeLatest(act => act.type.startsWith('FailureAnalysis/update/') && !act.type.endsWith('sync')
        , function*(action) {
          yield put({ type: 'get/all' })
        })
      },
      { type: 'watcher' }
    ],
    deptWatcher: [
      function*({ takeLatest, put }) {
        yield takeLatest(act => act.type === 'depts/update/depts' && location.href.indexOf(REPORT_NAME) > -1
        , function*(action) {
          yield put({ type: 'update/filter', data: { type: 'dept', data: { key: 'all_dept'}} })
          yield put({ type: 'get/all' })
        })
      },
      { type: 'watcher' }
    ],
  }

}
