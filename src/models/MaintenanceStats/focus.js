/* @flow */
export default {
  namespace: 'MaintenanceStats_focus',
  state: {
    data: undefined
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
