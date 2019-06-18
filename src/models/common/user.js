/* @flow */
import { IsHead, getOrgId } from '#/utils'

let info = {
  id: '###', // for debug,
  isHead: false,
  hospitalId: '9',
  orgId: '23',
}

const userInfoEl = document.getElementById('user-context')
if (userInfoEl) {
  const children = Array.from(userInfoEl.children)
  info = children.reduce((prev, cur) => {
    try {
      prev[cur.id] = JSON.parse(cur.value)
    } catch (err) {
      prev[cur.id] = cur.value
    }
    return prev
  }, {})
}

export default {
  namespace: 'user',
  state: {
    info
  },
  reducers: {
    ['info/set'] (state, { payload }) {
      return {
        ...state,
        info: payload
      }
    }
  }
}
