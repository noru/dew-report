import axios from 'axios'
import {pickBy, times} from 'lodash'
import moment from 'moment'
import {API_HOST} from '#/constants'
import {fetchData} from '#/utils'

export const PAGE_SIZE = 10

export default {
  namespace : 'groups',
  state : {
    loading: true,
    index: 0,
    total: 0,
    data: [],
    pastData: []
  },
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
  effects : {
    *['page/change'](_, {put}) {
      yield put({type: 'MaintenanceCost_filters/cursor/reset', level: 1})
      yield put({type: 'data/get'})
      const cursor = yield select(state => state.MaintenanceCost_filters.cursor)
    },
    *['data/get']({payload}, {put, call, select}) {
      const query = yield select(state => {
        const filters = state.MaintenanceCost_filters
        const groupby = filters.groupBy
        const {dept, assetType: type, supplier, target: rltgrp, MSA} = filters
        const {from, to} = filters.range
        const start = state.groups.index * PAGE_SIZE
        const limit = PAGE_SIZE
        return {
          from,
          to,
          groupby,
          dept,
          hospital: state.depts.selectedHospital,
          type,
          supplier,
          rltgrp,
          start,
          limit,
          msa: MSA
        }
      })
      const thresholdArray = yield select(state => state.thresholds)
      const threshold = thresholdArray.reduce((prev, cur, index) => (prev['condition' + (index + 1)] = cur, prev), {})
      const items = yield select(state => state.MaintenanceCost_assets.rate.map(item => {
        if (state.MaintenanceCost_filters.target === 'acyman') {
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
      try {
        const data = yield Promise.all(
          times(2, index => fetchData(API_HOST + '/ma', {data: {threshold, items}, params: query}))
        )
        yield put({type: 'data/get/succeeded', payload: data})
      } catch (err) {
        console.error(err)
      }
    }
  },
  reducers : {
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
    ['data/get/succeeded'](state, {payload}) {
      return {
        ...state,
        loading: false,
        data: payload[0].data.items,
        pastData: payload[1].data.items,
        total: payload[0].data.root.total
      }
    }
  }
}
