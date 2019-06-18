/* @flow */
import axios from 'axios'
import { routerRedux } from 'dva/router'
import { notification } from 'antd'
import { pageSize, defaultPage, API_HOST } from '#/constants'

export default {
  namespace: 'asset',
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

        if (pathname !== 'MaintenanceStats') return

        const { from, to, assetPage, dept, type, groupby, groupId } = query
        if (!from || !to) return

        if (!assetPage) {
          return dispatch(routerRedux.push({
            pathname: '/MaintenanceStats',
            query: {
              ...query,
              assetPage: defaultPage
            }
          }))
        }

        let payload = { from, to, page: assetPage, dept, type }
        if (groupby && groupId) {
          payload = {
            ...payload,
            groupby,
            groupId
          }
        }

        dispatch({
          type: 'data/get',
          payload
        })
      })
    }
  },
  effects: {
    *['data/get'] ({ payload: params }, { put, call, select, take }) {
      try {
        const { pageSize, query } = yield select(state => state.asset)

        // equal compare for pure object
        if (JSON.stringify(query) === JSON.stringify(params)) return

        yield put({ type: 'loading/on' })

        let user = yield select(state => state.user.info)

        const persistParams = user.isHead ? params : {
          ...params,
          dept: user.orgId
        }

        const { page, groupby, groupId, ...restQuery } = persistParams

        const { data } = yield call(
          axios,
          {
            url: API_HOST + '/pm',
            params: {
              ...restQuery,
              groupby: 'asset',
              [groupby]: groupId,
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
        }

        yield put({
          type: 'data/get/succeed',
          payload: data
        })

        yield put({
          type: 'query/update',
          payload: params
        })

        yield put({ type: 'loading/off' })
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
