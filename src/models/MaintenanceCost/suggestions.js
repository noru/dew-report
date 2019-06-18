import axios from 'axios'
import { flatMap } from 'lodash'
import { API_HOST } from '#/constants'
export default {
  namespace: 'suggestions',
  state: {
    MSA: [],
    notMSA: [],
    loading: false
  },
  effects: {
    *['data/get/all'](_, {put, select, call}) {
      try {
        const query = yield select(state => {
          const {filters} = state
          const {
            dept,
            assetType: type,
            supplier,
            target: rltgrp,
            cursor,
            groupBy
          } = filters
          const {from, to} = filters.range
          const res = {
            from,
            to,
            dept,
            hospital: state.depts.selectedHospital,
            type,
            supplier,
            rltgrp,
            groupby: groupBy
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
        const data = yield Promise.all(flatMap(['yes', 'no'], msa => ['lowonrate', 'highcost', 'bindonratecost'].map(condition => axios({
          method: 'PUT',
          url: API_HOST + '/ma/suggestion/' + condition,
          params: {...query, msa},
          data: {items, threshold}
        }))))
        yield put({
          type: 'data/get/all/succeeded',
          payload: data.map(({data}) => data)
        })
      } catch(err) {
        console.error(err)
      }
    }
  },
  reducers: {
    ['data/get/all'](state) {
      return {
        ...state,
        loading: true
      }
    },
    ['data/get/all/succeeded'](state, { payload }) {
      return {
        ...state,
        MSA: payload.slice(0, 3),
        notMSA: payload.slice(3, 6),
        loading: false
      }
    }
  }
}
