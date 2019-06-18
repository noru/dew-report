/* @flow */
export default {
  namespace: 'focus',
  state: {
    data: undefined
  },
  effects: {
    *['set'] ({ payload }, { put }) {
      try {
        yield put({
          type: 'set/succeed',
          payload: {
            id: payload.owner_id,
            ...payload
          }
        })
      } catch (err) {
      }
    }     
  },
  reducers: {
    ['set/succeed'] (state, { payload }) {
      return {
        ...state,
        data: payload
      }
    }
  }
}
