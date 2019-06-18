import axios from 'axios'
import {pickBy} from 'lodash'
import moment from 'moment'
import {API_HOST} from '#/constants'
import {fetchData} from '#/utils'

export const PAGE_SIZE = 20
export default {
  namespace : 'MaintenanceCost_assets',
  subscriptions : {
    setup({history, dispatch}) {
      return history.listen(({ query, pathname }) => {
        if (pathname !== 'MaintenanceCost') return
        dispatch({
          type: 'data/get'
        })
      })
    }
  },
  state : {
    loading: true,
    rateLoading: false,
    data: [],
    rate: [],
    index: 0,
    total: 0
  },
  effects : {
    *['page/change'](_, {put, select}) {
      yield put({type: 'MaintenanceCost_filters/cursor/reset', level: 2})
      yield put({type: 'data/get'})
      const to = yield select(state => state.MaintenanceCost_filters.range.to)
      if (moment(to) > moment()) {
        yield put({
          type: 'rate/get'
        })
        // const cursor = yield select(state => state.MaintenanceCost_filters.cursor)
        // if (cursor.length < 2) yield put({
        //   type: 'suggestions/data/get/all'
        // })
      }
    },
    *['data/get']({payload}, {put, select, call}) {
      const query = yield select(state => {
        const filters = state.MaintenanceCost_filters
        const {
          dept,
          assetType: type,
          supplier,
          target: rltgrp,
          cursor,
          groupBy,
          MSA
        } = filters
        const {from, to} = filters.range
        const start = state.MaintenanceCost_assets.index * PAGE_SIZE
        const limit = PAGE_SIZE
        const res = {
          from,
          to,
          dept,
          hospital: state.depts.selectedHospital,
          type,
          supplier,
          rltgrp,
          start,
          limit,
          msa: MSA
        }
        if (res[groupBy] === undefined)
          res[groupBy] = cursor[0]
        return res
      })
      const thresholdArray = yield select(state => state.thresholds)
      const threshold = thresholdArray.reduce((prev, cur, index) => (prev['condition' + (index + 1)] = cur, prev), {})
      const items = yield select(state => state.MaintenanceCost_assets.rate.map(item => {
        if (state.filters.target === 'acyman') {
          return {
            id: item.id,
            onrate_increase: item.onrate_increase,
            cost1_increase: item.labor_increase,
            cost2_increase: item.parts_increase,
          }
        } else {
          return {
            id: item.id,
            onrate_increase: item.onrate_increase,
            cost1_increase: item.repair_increase,
            cost2_increase: item.PM_increase
          }
        }
      }))
      const thresholds = yield select(state => state.thresholds)
      try {
        const { data } = yield call(fetchData, API_HOST + '/ma', {data: {threshold, items}, params: query})
        yield put({type: 'data/get/succeeded', payload: data.items, total: data.root.total})
      } catch (err) {
        console.error(err)
      }
    },
    *['rate/get']({payload}, {put, select, call}) {
      const query = yield select(state => {
        const {filters} = state
        const {
          dept,
          assetType: type,
          supplier,
          target: rltgrp,
          cursor,
          groupBy,
          MSA
        } = filters
        const {from, to} = filters.range
        const start = state.MaintenanceCost_assets.index * PAGE_SIZE
        const limit = PAGE_SIZE
        const res = {
          from,
          to,
          dept,
          hospital: state.depts.selectedHospital,
          type,
          supplier,
          rltgrp,
          start,
          limit,
          msa: MSA
        }
        if (res[groupBy] === undefined)
          res[groupBy] = cursor[0]
        return res
      })
      const thresholdArray = yield select(state => state.thresholds)
      const threshold = thresholdArray.reduce((prev, cur, index) => (prev['condition' + (index + 1)] = cur, prev), {})
      const items = []
      const thresholds = yield select(state => state.thresholds)
      try {
        const { data } = yield call(axios, {
          method: 'PUT',
          url: API_HOST + '/ma/forecastrate',
          data: {threshold, items},
          params: query
        })
        yield put({type: 'rate/get/succeeded', payload: data.items})
      } catch (err) {
        console.error(err)
      }
    }
  },
  reducers : {
    ['rate/change'](state, {payload, field, id}) {
      const index = state.rate.findIndex(item => item.id === id)
      state.rate[index][field] = payload
      return {
        ...state,
        rate: [...state.rate]
      }
    },
    ['rate/get'](state) {
      return {
        ...state,
        rateLoading: true
      }
    },
    ['rate/get/succeeded'](state, {payload}) {
      return {
        ...state,
        rate: payload,
        rateLoading: false
      }
    },
    ['page/change'](state, {payload}) {
      return {
        ...state,
        index: payload
      }
    },
    ['page/reset'](state, {payload}) {
      return {
        ...state,
        index: 0
      }
    },
    ['data/get'](state, {payload}) {
      return {
        ...state,
        loading: true
      }
    },
    ['data/get/succeeded'](state, {payload, total}) {
      return {
        ...state,
        loading: false,
        data: payload,
        total
      }
    },
    ['pastData/get'](state, {payload}) {
      return {
        ...state
      }
    },
    ['pastData/get/succeeded'](state, {payload}) {
      return {
        ...state,
        pastData: payload
      }
    }
  }
}
