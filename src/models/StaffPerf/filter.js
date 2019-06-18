/* @flow */
import { ORDER, HOUR, RATE } from '#/constants'

export default {
  namespace: 'filter',
  state: {
    data: HOUR
  },
  effects: {   
  },
  reducers: {
    ['set'] (state, { payload }) {
      return {
        ...state,
        data: payload
      }
    }
  }
}
