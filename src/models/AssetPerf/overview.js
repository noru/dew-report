import axios from 'axios'
import { API_HOST, dateFormat } from '#/constants'
import moment from 'moment'
import { pickBy } from 'lodash'
import { IsHead, getOrgId } from '#/utils'

const isHead = IsHead()
const orgId = getOrgId()

export default {
  namespace: 'overview',
  state: {
    data: [],
    loading: true
  },
  subscriptions: {
    setup({dispatch, history}) {
      return history.listen(({ query, pathname }) => {
        if (pathname !== 'AssetPerf') return
        dispatch({
          type: 'data/get'
        })
      })
    }
  },
  effects: {
    *['data/get']({ payload }, { put, select, call }) {
      const now = moment()
      const yesterday = now.clone().subtract(1, 'day')
      try {
        const res = yield Promise.all([
          axios({
            method: 'get',
            url: API_HOST + '/profit',
            params: pickBy({
              from: now.clone().subtract(2, 'year').startOf('year').format(dateFormat),
              to:  now.clone().subtract(2, 'year').endOf('year').format(dateFormat),
              dept: orgId
            })
          }),
          axios({
            method: 'get',
            url: API_HOST + '/profit',
            params: pickBy({
              from: now.clone().subtract(1, 'year').startOf('year').format(dateFormat),
              to:  now.clone().subtract(1, 'year').endOf('year').format(dateFormat),
              dept: orgId
            })
          }),
          axios({
            method: 'get',
            url: API_HOST + '/profit',
            params: pickBy({
              from: yesterday.clone().startOf('year').format(dateFormat),
              to: yesterday.clone().format(dateFormat),
              dept: orgId
            })
          }),
          // forecast tab is already hidden
          // axios({
          //   method: 'get',
          //   url: API_HOST + '/profit/forecast',
          //   params: pickBy({
          //     from: now.clone().startOf('year').format(dateFormat),
          //     to: now.clone().endOf('year').format(dateFormat),
          //     dept: orgId
          //   })
          // }),
          // axios({
          //   method: 'get',
          //   url: API_HOST + '/profit/forecastrate',
          //   params: pickBy({
          //     from: now.clone().startOf('year').format(dateFormat),
          //     to: now.clone().endOf('year').format(dateFormat),
          //     groupby: 'type',
          //     dept: orgId
          //   })
          // })
        ])
        const data = res.map(item => item.data.root)
        yield put({
          type: 'data/get/succeeded',
          payload: data
        })
      } catch (err) {
        console.log(err);
      }
    }
  },
  reducers: {
    ['data/get'](state, { payload }) {
      return {
        ...state,
        loading: true
      }
    },
    ['data/get/succeeded'](state, { payload }) {
      return {
        ...state,
        data: payload,
        loading: false
      }
    }
  }
}
