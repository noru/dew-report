import axios from 'axios'
import { API_HOST } from '#/constants'

export default {

  namespace: 'hospitals',

  state: [],

  subscriptions: {
    setup({history, dispatch}) {
      return history.listen(({ query, pathname }) => {
        dispatch({
          type: 'get'
        })
      })
    }
  },

  effects: {
    *['get']({ payload }, { put, call }) {
      try {
        const { data } = yield call(axios, API_HOST + '/all_hospitals') // todo,
        yield put({
          type: 'get/succeeded',
          payload: data, // todo
        })
      } catch(err) {
        console.error(err)
      }
    }
  },

  reducers: {
    ['get/succeeded'](state, { payload }) {
      return payload
    }
  }

}
