import React from 'react'
import { Router, Route, Redirect } from 'dva/router'
import Bundle from '#/components/common/Bundle'

const AssetBrowser = loaderHelper(require('bundle-loader?lazy&name=AssetBrowser!./containers/AssetBrowser'))
const AssetPerf = loaderHelper(require('bundle-loader?lazy&name=AssetPerf!./containers/AssetPerf'))
const DecisionMaking = loaderHelper(require('bundle-loader?lazy&name=DecisionMaking!./containers/DecisionMaking'))
const FailureAnalysis = loaderHelper(require('bundle-loader?lazy&name=FailureAnalysis!./containers/FailureAnalysis/App'))
const MaintenanceCost = loaderHelper(require('bundle-loader?lazy&name=MaintenanceCost!./containers/MaintenanceCost'))
const MaintenanceStats = loaderHelper(require('bundle-loader?lazy&name=MaintenanceStats!./containers/MaintenanceStats'))
const ProcessAnalysis = loaderHelper(require('bundle-loader?lazy&name=ProcessAnalysis!./containers/ProcessAnalysis/App'))
const StaffPerf = loaderHelper(require('bundle-loader?lazy&name=StaffPerf!./containers/StaffPerf'))
const ScanDetails = loaderHelper(require('bundle-loader?lazy&name=ScanDetails!./containers/ScanDetails'))
const Nurse = loaderHelper(require('bundle-loader?lazy&name=Nurse!./containers/Nurse'))

export default ({history}) => (
  <Router history={history}>
    <Redirect path="/" to="AssetBrowser" />
    <Route exact path="/AssetBrowser" component={AssetBrowser} />
    <Route exact path="/AssetPerf" component={AssetPerf} />
    <Route exact path="/DecisionMaking" component={DecisionMaking} />
    <Route exact path="/FailureAnalysis" component={FailureAnalysis}/>
    <Route exact path="/MaintenanceCost" component={MaintenanceCost} />
    <Route exact path="/MaintenanceStats" component={MaintenanceStats} />
    <Route exact path="/ProcessAnalysis" component={ProcessAnalysis} />
    <Route exact path="/ScanDetails" component={ScanDetails} />
    <Route exact path="/StaffPerf" component={StaffPerf} />
    <Route exact path="/Nurse" component={Nurse} />
  </Router>
)

export function loaderHelper(loader) {

  return props => <Bundle load={loader}>
    { Comp => <Comp {...props}/> }
  </Bundle>

}