/* @flow */
import axios from 'axios'
import { routerRedux } from 'dva/router'
import { notification } from 'antd'
import { API_HOST } from '#/constants'
import moment from 'moment'

import { now, dateFormat, pageSize, defaultPage } from '#/constants'

const defaultRange = {
  from: moment(now).clone().subtract(0.5, 'year').format(dateFormat),
  to: moment(now).clone().format(dateFormat)
}

function mockRoot (root) {
  return {
    ...root,
    isRoot: true,
    owner_id: null,
    owner_name: '所有人'
  }
}

export default {
  namespace: 'list',
  state: {
    loading: false,
    root: undefined,
    range: undefined,
    items: [],
    pageSize: pageSize,
    page: defaultPage,
    total: 0,
    query: {}
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      return history.listen(({ query, pathname }) => {

        if (pathname !== 'StaffPerf') return

        const { from, to, page } = query
        if (!from || !to) {
          return dispatch(routerRedux.push({
            pathname: '/StaffPerf',
            query: {
              ...query,
              ...defaultRange
            }
          }))
        }

        if (!page) {
          return dispatch(routerRedux.push({
            pathname: '/StaffPerf',
            query: {
              ...query,
              page: defaultPage
            }
          }))
        }

        dispatch({
          type: 'data/get',
          payload: { from, to, page }
        })
      })
    }
  },
  effects: {
    *['data/get'] ({ payload: params }, { put, call, select, take }) {
      try {
        const { pageSize, query } = yield select(state => state.list)

        const flag = ['from', 'to', 'page'].reduce((prev, cur) => {
          if (query[cur] !== params[cur]) prev = false
          return prev
        }, true)
        if (flag) return

        yield put({ type: 'loading/on' })

        const { page, ...restQuery } = params

        const { data } = yield call(
          axios,
          {
            url: API_HOST + '/staff',
            params: {
              ...restQuery,
              start: (page - 1) * pageSize,
              limit: pageSize
            }
          }
        )

        if (
          (data.pages && !data.pages.total)
          || (Array.isArray(data.items) && !data.items.length)
        ) {
          yield put({
            type: 'data/status/empty'
          })
        } else {
          yield put({
            type: 'data/get/succeed',
            payload: data
          })

          yield put({
            type: 'query/update',
            payload: params
          })

          yield put({
            type: 'range/set',
            payload: data.range
          })

          const root = yield call(mockRoot, data.summary)

          yield put({
            type: 'root/set',
            payload: root
          })

          yield put({
            type: 'focus/set',
            payload: root
          })

          yield put({ type: 'loading/off' })
        }
      } catch (err) {
        yield put({
          type: 'data/status/failed',
          payload: err
        })
      }
    },
    *['data/status/failed'] ({ payload: err }) {
      notification.error({
        message: '数据加载出错，请尝试刷新页面',
        description: err.message
      })
    },
    *['data/status/empty'] () {
      notification.warning({
        message: '暂无可用设备数据',
        description: '请稍后再试'
      })
    }
  },
  reducers: {
    ['data/get/succeed'] (state, { payload }) {
      return {
        ...state,
        total: payload.pages.total,
        items: payload.items
      }
    },
    ['root/set'] (state, { payload }) {
      return {
        ...state,
        root: payload
      }
    },
    ['range/set'] (state, { payload }) {
      return {
        ...state,
        range: payload
      }
    },
    ['query/update'] (state, { payload }) {
      return {
        ...state,
        query: payload
      }
    },
    ['loading/on'] (state, action) {
      return {
        ...state,
        loading: true
      }
    },
    ['loading/off'] (state, action) {
      return {
        ...state,
        loading: false
      }
    }
  }
}
