import { cloneDeep } from 'lodash-es'
import { ProcessAnalysis as API } from '#/services'
import { error } from '#/utils/logger'
import EventBus from 'eventbusjs'
import moment from 'moment'
import { DateFormat, GroupByMap, DataTypeMap } from '#/utils/converters'

const REPORT_NAME = 'ProcessAnalysis'

export default {

  namespace: `${REPORT_NAME}`,

  state: {
    filterBy: {
      assettype: 'all_asset_type',
      dept: 'all_dept',
      hospital: 'default_hospital',
    },
    period: {
      from: moment(new Date().getFullYear(), 'YYYY'),
      to: moment()
    },
    dataType: 'response_time',
    display: 'display_asset_type', // type | supplier | name
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
    distributionEttr: [0, 24 * 3600, 3 * 24 * 3600 , 7 * 24 * 3600], // 1, 3, 7 days
    distributionResponse: [0, 15 * 60, 30 * 60 , 3600], // 15, 30, 60 mins
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
        to: data[1],
      }
      return state
    },

    ['update/datatype'](state, { data }) {
      state = cloneDeep(state)
      state.dataType = data
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
    },

    ['update/distributionEttr'](state, { data }) {
      state = cloneDeep(state)
      state.distributionEttr = data
      return state
    },
    ['update/distributionResponse'](state, { data }) {
      state = cloneDeep(state)
      state.distributionResponse = data
      return state
    },
  },

  effects: {
    *['get/all'](action, { put }) {
      yield put({ type: 'get/briefs' })
      yield put({ type: 'get/details' })
      yield put({ type: 'get/gross' })
      yield put({ type: 'get/phase', data: 'ettr' })
      yield put({ type: 'get/phase', data: 'response_time' })
    },
    *['page/change'](action, { put }) {
      if (action.data.type === 'brief') {
        yield put({ type: 'get/briefs', data: { type: action.type, pageNumber: action.data.value } })
      } else {
        yield put({ type: 'get/details', data: { type: action.type, pageNumber: action.data.value } })
      }
    },
    *['get/briefs'](action, { put, select, call }) {
      try {
        let store = yield select(state => ({ ...state[REPORT_NAME], hospital: state.depts.selectedHospital }))
        let params = mapParamsBrief(store)
        if (action.data && action.data.type === 'ProcessAnalysis/page/change') {
          params.start = params.limit * (action.data.pageNumber - 1)
        }
        let briefs = yield call(API.getBriefs, params)
        // sync pagination
        let value = {
          total: briefs.page.total,
          skip: briefs.page.start,
        }
        yield put({ type: 'update/pagination/sync', data: { type: 'left', value } })
        EventBus.dispatch('process-analysis-brief-data', this, briefs)
      } catch (e) {
        error(e)
      }
    },
    *['get/details'](action, { put, select, call }) {
      try {
        let store = yield select(state => ({ ...state[REPORT_NAME], hospital: state.depts.selectedHospital }))
        let params = mapParamsDetail(store)
        if (action.data && action.data.type === 'ProcessAnalysis/page/change') {
          params.start = params.limit * (action.data.pageNumber - 1)
        }

        let details = yield call(API.getDetails, params)
        // sync pagination
        let value = {
          total: details.page.total,
          skip: details.page.start,
        }
        yield put({ type: 'update/pagination/sync', data: { type: 'right', value } })
        EventBus.dispatch('process-analysis-detail-data', this, details)
      } catch (e) {
        error(e)
      }
    },
    *['get/gross'](action, { put, select, call }) {
      try {
        let store = yield select(state => ({ ...state[REPORT_NAME], hospital: state.depts.selectedHospital }))
        let params = mapParamsGross(store)
        let gross = yield call(API.getGross, params)
        EventBus.dispatch('process-analysis-gross-data', this, gross)
      } catch (e) {
        error(e)
      }
    },
    *['get/phase'](action, { select, call }) {
      try {
        let store = yield select(state => ({ ...state[REPORT_NAME], hospital: state.depts.selectedHospital }))
        let params = mapParamsPhase(store, action.data)
        let phase = yield call(API.getPhase, params)
        phase.phase = params.phase
        EventBus.dispatch('process-analysis-phase-data', this, phase)
      } catch (e) {
        error(e)
      }
    },
    paramWatcher: [
      function*({ takeLatest, put }) {
        yield takeLatest(act => act.type.startsWith('ProcessAnalysis/update/') && !act.type.endsWith('sync')
        , function*(action) {
          if (action.type.startsWith('ProcessAnalysis/update/distribution')) {
            yield put({ type: 'get/phase' })
          } else {
            yield put({ type: 'get/all' })
          }
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

/* Copy/Paste from Process Analysis sagas */
function mapParamsBrief(params) {
  let { filterBy: { assettype, dept }, period, pagination, dataType, hospital } = params
  return {
    from: _format(period.from),
    to: _format(period.to),
    start: pagination.left.skip,
    limit: pagination.left.top,
    groupby: GroupByMap[params.display],
    type: assettype === 'all_asset_type' ? undefined : assettype ,
    dept: dept === 'all_dept' ? undefined : dept,
    hospital,
    orderby: DataTypeMap[dataType]
  }
}

function mapParamsDetail(params) {
  let { filterBy: { assettype, dept }, period, pagination, dataType, hospital } = params
  return {
    from: _format(period.from),
    to: _format(period.to),
    start: pagination.right.skip,
    limit: pagination.right.top,
    type: assettype === 'all_asset_type' ? undefined : assettype ,
    dept: dept === 'all_dept' ? undefined : dept,
    hospital,
    orderby: DataTypeMap[dataType]
  }
}

function mapParamsGross(params) {
  let { filterBy: { assettype, dept }, period, hospital } = params
  return {
    from: _format(period.from),
    to: _format(period.to),
    typeId: assettype === 'all_asset_type' ? undefined : assettype ,
    deptId: dept === 'all_dept' ? undefined : dept,
    hospital,
  }
}

function mapParamsPhase(params, phase) {
  let {
    filterBy: { assettype, dept },
    period, dataType,
    distributionEttr, distributionResponse,
    hospital,
  } = params
  dataType = phase || dataType
  let distribution
  if (dataType === 'ettr') {
    distribution = distributionEttr
  } else { // response_time
    distribution = distributionResponse
  }
  return {
    from: _format(period.from),
    to: _format(period.to),
    typeId: assettype === 'all_asset_type' ? undefined : assettype ,
    deptId: dept === 'all_dept' ? undefined : dept,
    hospital: hospital,
    t1: distribution[1],
    t2: distribution[2],
    tmax: distribution[3],
    phase: DataTypeMap[dataType]
  }
}

function _format(date) {
  if (typeof date === 'string') {
    date = moment(date)
  }
  return date.format(DateFormat)
}