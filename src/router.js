import React from 'react'
import { Router, Route, Redirect } from 'dva/router'
import Bundle from '#/components/common/Bundle'

const FailureAnalysis = loaderHelper(
  require('bundle-loader?lazy&name=FailureAnalysis!./containers/FailureAnalysis/App')
)
const ProcessAnalysis = loaderHelper(
  require('bundle-loader?lazy&name=ProcessAnalysis!./containers/ProcessAnalysis/App')
)
const Nurse = loaderHelper(require('bundle-loader?lazy&name=Nurse!./containers/Nurse'))

export default ({ history }) => (
  <Router history={history}>
    <Redirect path="/" to="/Nurse" />
    <Route exact path="/FailureAnalysis" component={FailureAnalysis} />
    <Route exact path="/ProcessAnalysis" component={ProcessAnalysis} />
    <Route exact path="/Nurse" component={Nurse} />
  </Router>
)

export function loaderHelper(loader) {
  return props => <Bundle load={loader}>{Comp => <Comp {...props} />}</Bundle>
}
