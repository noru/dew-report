import axios from 'axios'
import { API_HOST } from '#/constants'

export default {

  namespace: 'depts',

  state: {
    selectedHospital: undefined,
    hospitals: [],
    depts: [],
  },

  subscriptions: {
    setup({history, dispatch}) {
      return history.listen(({ query, pathname }) => {
        dispatch({ type: 'get/all' })
      })
    }
  },

  effects: {
    *'get/all'({ payload }, { put, call, select }) {
      try {
        let { data: hospitals } = yield call(axios, API_HOST + '/org/allOrg')
        yield put({ type: 'update/hospitals', payload: hospitals })
        let hospitalId = yield select(state => state.user.info.hospitalId)
        yield put({ type: 'update/selectedHospital', payload: hospitalId })
      } catch(err) {
        console.error(err)
      }
    },
    *'get/depts'({ payload = '' }, { call, put }) {
      try {
        let { data } = yield call(axios, API_HOST + '/org/dept?orgId=' + payload)
        yield put({ type: 'update/depts', payload: data.orgInfos })
      } catch (err) {
        console.error(err)
      }
    },
    watchHospital: [function* ({ takeLatest, put }) {
      yield takeLatest(act => act.type === 'depts/update/selectedHospital',
      function*({ payload }) {
        yield put({ type: 'get/depts', payload })
      })
    }, { type: 'watcher' }]
  },

  reducers: {
    'update/hospitals'(state, { payload }) {
      return { ...state, hospitals: payload }
    },
    'update/depts'(state, { payload }) {
      return { ...state, depts: payload }
    },
    'update/selectedHospital'(state, { payload }) {
      return { ...state, selectedHospital: payload }
    },
  }

}
