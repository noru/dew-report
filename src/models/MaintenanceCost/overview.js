import moment from 'moment'
import axios from 'axios'
import { pickBy } from 'lodash'
import { API_HOST } from '#/constants'
import { fetchData } from '#/utils'

export default {
  namespace: 'MaintenanceCost_overview',
  state: {
    data: {},
    pastData: {},
    loading: true
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ query, pathname }) => {
        if (pathname !== 'MaintenanceCost') return
        dispatch({
          type: 'data/get'
        })
      })
    }
  },
  effects: {
    *['data/get']({ payload }, { put, call, select }) {
      const { from, to, groupby, hospital, dept, type, supplier, rltgrp, start, limit, cursor } = yield select(state => {
        const filters = state.MaintenanceCost_filters
        const groupby = filters.groupBy
        const { dept, assetType: type, supplier, target: rltgrp, cursor } = filters
        const { from, to } = filters.range
        const start = 0
        const limit = 10
        const hospital = state.depts.selectedHospital
        const res = { from, to, groupby, dept, type, supplier, rltgrp, start, limit, cursor, hospital }
        if (res[groupby] === undefined) res[groupby] = cursor[0]
        return res
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

      if (cursor[1]) {
        try {
          const data = yield Promise.all([
            fetchData([API_HOST + '/ma/asset/' + cursor[1], API_HOST + '/ma/forecast/asset/' + cursor[1]], {data: {threshold, items}, params: {from, to, rltgrp: 'acyman'}}),
            fetchData([API_HOST + '/ma/asset/' + cursor[1], API_HOST + '/ma/forecast/asset/' + cursor[1]], {data: {threshold, items}, params: {from, to, rltgrp: 'mtpm'}}),
            fetchData([API_HOST + '/ma/asset/' + cursor[1], API_HOST + '/ma/forecast/asset/' + cursor[1]], {data: {threshold, items}, params: {from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'), to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'), rltgrp: 'acyman'}}),
            fetchData([API_HOST + '/ma/asset/' + cursor[1], API_HOST + '/ma/forecast/asset/' + cursor[1]], {data: {threshold, items}, params: {from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'), to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'), rltgrp: 'mtpm'}})
          ])
          yield put({
            type: 'data/get/succeeded',
            payload: data.map(({ data }) => data[0])
          })
        } catch(err) {
          console.error(err)
        }
      } else {
        try {
          const data = yield Promise.all([
            fetchData(API_HOST + '/ma', {data: {threshold, items}, params: {from, to, groupby, hospital, dept, type, supplier, rltgrp: 'acyman'}}),
            fetchData(API_HOST + '/ma', {data: {threshold, items}, params: {from, to, groupby, hospital, dept, type, supplier, rltgrp: 'mtpm'}}),
            fetchData(API_HOST + '/ma', {data: {threshold, items}, params: {from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'), to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'), groupby, hospital, dept, type, supplier, rltgrp: 'acyman'}}),
            fetchData(API_HOST + '/ma', {data: {threshold, items}, params: {from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'), to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'), groupby, hospital, dept, type, supplier, rltgrp: 'mtpm'}})
          ])
          yield put({
            type: 'data/get/succeeded',
            payload: data.map(({ data }) => data.root)
          })
        } catch(err) {
          console.error(err)
        }
      }
    }
  },
  reducers: {
    ['data/get'](state) {
      return {
        ...state,
        loading: true
      }
    },
    ['data/get/succeeded'](state, { payload }) {
      return {
        ...state,
        loading: false,
        data: {
          ...payload[0],
          ...payload[1]
        },
        pastData: {
          ...payload[2],
          ...payload[3]
        }
      }
    }
  }
}
