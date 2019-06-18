/* @flow */
import axios from 'axios'
import { routerRedux } from 'dva/router'
import { notification } from 'antd'

import { currentYear, API_HOST } from '#/constants'

export default {
  namespace: 'finance',
  state: {
    loading: false,
    error: false,
    systemData: undefined,
    manualData: undefined,
    query: {}
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      return history.listen(({ query, pathname }) => {

        if (pathname !== 'DecisionMaking') return

        const { groupby, year } = query

        if (!groupby) {
          return dispatch(routerRedux.push({
            pathname: '/DecisionMaking',
            query: {
              ...query,
              groupby: 'type'
            }
          }))
        }

        if (!year) {
          return dispatch(routerRedux.push({
            pathname: '/DecisionMaking',
            query: {
              ...query,
              year: currentYear
            }
          }))
        }

        dispatch({
          type: 'data/get',
          payload: query
        })
      })
    }
  },
  effects: {
    *['data/get'] ({ payload: query }, { put, call, select, take }) {
      try {
        yield put({ type: 'loading/on' })

        let user = yield select(state => state.user.info)
        if (!user.id) {
          const action = yield take('user/info/set')
          user = action.payload
        }

        const params = user.isHead ? query : { year: query.year, dept: user.orgId }

        const { data } = yield call(
          axios,
          {
            url: API_HOST + '/dmv2',
            params
          }
        )

        if (!data.items || (Array.isArray(data.items) && !data.items.length)) {
          yield put({
            type: 'data/status/empty'
          })
        } else {
          yield put({
            type: 'query/update',
            payload: params
          })

          yield put({
            type: 'data/get/succeed',
            payload: data
          })

          yield put({
            type: 'DecisionMaking_focus/cursor/reset'
          })

          yield put({
            type: 'DecisionMaking_config/changes/reset'
          })

          yield put({
            type: 'nodeList/data/get',
            payload: data
          })

          yield put({ type: 'loading/off' })

          // init config
          const action = yield take('nodeList/data/get/succeed')
          yield put({
            type: 'DecisionMaking_config/data/set',
            payload: action.payload
          })
        }
      } catch (err) {
        yield put({
          type: 'data/status/failed',
          payload: err
        })
      }
    },
    *['data/put'] ({ payload }, { put, call, select, take }) {
      try {
        const { query } = yield select(state => state.finance)

        const { data } = yield call(
          axios,
          {
            method: 'put',
            url: API_HOST + '/dmv2',
            params: query,
            data: { config: payload }
          }
        )

        if (!data.items || (Array.isArray(data.items) && !data.items.length)) {
          yield put({
            type: 'data/status/empty'
          })
        } else {
          yield put({
            type: 'data/put/succeed',
            payload: data
          })

          yield put({
            type: 'nodeList/data/get',
            payload: data
          })

          // set config
          const action = yield take('nodeList/data/get/succeed')
          yield put({
            type: 'DecisionMaking_config/data/set',
            payload: action.payload
          })

          // get the new focus node
          yield put({
            type: 'DecisionMaking_focus/node/set'
          })
        }
      } catch (err) {
        yield put({
          type: 'data/status/failed',
          payload: err
        })
      }
    },
    *['data/toggle'] ({ payload = 'system' }, { put, select }) {
      try {
        const finance = yield select(state => state.finance)
        const dataKey = `${payload}Data`
        yield put({
          type: 'nodeList/data/get',
          payload: finance[dataKey]
        })

        // update focus for mannual/system
        yield put({
          type: 'DecisionMaking_focus/node/set'
        })
      } catch (err) {

      }
    },
    *['data/status/failed'] ({ payload: err }, { put }) {
      notification.error({
        message: '数据加载出错，请尝试刷新页面',
        description: err.message
      })
      yield put({ type: 'data/get/failed' })
      yield put({ type: 'loading/off' })
    },
    *['data/status/empty'] (undefined, { put }) {
      notification.warning({
        message: '暂无可用设备数据',
        description: '请稍后再试'
      })
      yield put({ type: 'loading/off' })
    }
  },
  reducers: {
    ['data/get/succeed'] (state, { payload }) {
      return {
        ...state,
        systemData: payload,
        manualData: payload
      }
    },
    ['data/get/failed'] (state, { payload }) {
      return {
        ...state,
        error: true
      }
    },
    ['data/put/succeed'] (state, { payload }) {
      return {
        ...state,
        manualData: payload
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
        loading: true,
        error: false
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
