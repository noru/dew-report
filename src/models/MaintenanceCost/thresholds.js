export default {
  namespace: 'thresholds',
  state: [
    [0.8],
    [0.1],
    [0.8, 0.95, 0.1, 0.01]
  ],
  reducers: {
    ['set'](state, { payload, i, j }) {
      const res = {...state}
      res[i][j] = payload
      res[i] = {...res[i]}
      return res
    }
  }
}
