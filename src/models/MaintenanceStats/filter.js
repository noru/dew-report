/* @flow */
import axios from 'axios'
import { notification } from 'antd'
import { COMPLETION, QUALITY, API_HOST } from '#/constants'

export default {
  namespace: 'MaintenanceStats_filter',
  state: {
    loading: false,
    depts: [],
    types: [],
    switcher: COMPLETION
  },
  effects: {
    *['data/get'] (action, { put, call, select, take }) {
      try {
        yield put({
          type: 'dept/get'
        })

        yield put({
          type: 'type/get'
        })
      } catch (err) {
        yield put({
          type: 'data/status/failed',
          payload: err
        })
      }
    },
    *['dept/get'] (action, { put, call, select, take }) {
      try {
        const { data } = yield call(
          axios,
          {
            url: API_HOST + '/org/all'
          }
        )

        const depts = data.orgInfos.map(n => ({
          id: n.id,
          name: n.name
        }))

        yield put({
          type: 'dept/get/succeed',
          payload: depts
        })
      } catch (err) {
      }
    },
    *['type/get'] (action, { put, call, select, take }) {
      try {
        const { data } = yield call(
          axios,
          {
            url: API_HOST + '/msg?type=assetGroup'
          }
        )

        const types = Object.keys(data).map(key => ({
          id: key,
          name: data[key]
        }))

        yield put({
          type: 'type/get/succeed',
          payload: types
        })
      } catch (err) {
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
    ['switcher/set'] (state, { payload }) {
      return {
        ...state,
        switcher: payload
      }
    },
    ['dept/get/succeed'] (state, { payload }) {
      return {
        ...state,
        depts: payload
      }
    },
    ['type/get/succeed'] (state, { payload }) {
      return {
        ...state,
        types: payload
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
