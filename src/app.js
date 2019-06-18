import React from 'react'
import ReactDOM from 'react-dom'
import dva from 'dva'
import { AppContainer } from 'react-hot-loader'
import { useRouterHistory } from 'dva/router'
import createHashHistory from 'history/lib/createHashHistory'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import './polyfill'
import './app.css'
import './styles/glob.sass'
import './styles/index.scss'

import router from '#/router'
/* Common Models*/
import user from '#/models/common/user'
import assetTypes from '#/models/common/assetTypes'
import depts from '#/models/common/depts'
import hospitals from '#/models/common/hospitals'
/* Asset Browser */
import assetBrowser from '#/models/assetBrowser'
/* AssetPerf */
import profit from '#/models/AssetPerf/profit'
import config from '#/models/AssetPerf/config'
import filters from '#/models/AssetPerf/filters'
import overview from '#/models/AssetPerf/overview'
/* StaffPerf */
import staffPerfModels from '#/models/StaffPerf'
/* Scan Details */
import assets from '#/models/ScanDetails/assets'
import briefs from '#/models/ScanDetails/briefs'
import sd_filters from '#/models/ScanDetails/filters'
import steps from '#/models/ScanDetails/steps'
/* Maintenance Cost */
import mc_filters from '#/models/MaintenanceCost/filters'
import groups from '#/models/MaintenanceCost/groups'
import mc_assets from '#/models/MaintenanceCost/assets'
import mc_overview from '#/models/MaintenanceCost/overview'
import forecastOverview from '#/models/MaintenanceCost/forecastOverview'
import thresholds from '#/models/MaintenanceCost/thresholds'
import suggestions from '#/models/MaintenanceCost/suggestions'
import confirm from '#/models/MaintenanceCost/confirm'
/* Maintenance Stats */
import maintenanceStatsModels from '#/models/MaintenanceStats'
/* Decision Making */
import decisionMakingModels from '#/models/DecisionMaking'
/* Process Analysis */
import processAnalysis from '#/models/ProcessAnalysis'
/* Failure Analysis */
import failureAnalysis from '#/models/FailureAnalysis'
/* Nurse station */
import Nurse from '#/models/Nurse'


const historyEngine = useRouterHistory(createHashHistory)({
  queryKey: false,
  basename: '/'
})
const app = dva({
  history: historyEngine,
  onError: e => {
    if (process.env.NODE_ENV === 'production') return
    console.log(e)
  }
})

/** Common */
app.model(user)
app.model(assetTypes)
app.model(depts)
/** Asset Browser */
app.model(assetBrowser)
/* Asset Perf */
app.model(profit)
app.model(config)
app.model(filters)
app.model(overview)
/* Staff Perf */
staffPerfModels.forEach(model => app.model(model))
/* Scan Details */
app.model(assets)
app.model(briefs)
app.model(sd_filters)
app.model(steps)
/* Maintenance Cost */
app.model(mc_filters)
app.model(groups)
app.model(mc_assets)
app.model(mc_overview)
app.model(forecastOverview)
app.model(thresholds)
app.model(suggestions)
app.model(confirm)
/* Maintenance Stats */
maintenanceStatsModels.forEach(model => app.model(model))
/* Decision Making */
decisionMakingModels.forEach(model => app.model(model))
/* Process Analysis */
app.model(processAnalysis)
/* Failure Analysis */
app.model(failureAnalysis)
/* Nurse station */
app.model(Nurse)

app.router(router)

function render(router) {
  const App = router ? app._getProvider(router) : app.start()
  ReactDOM.render((
    <AppContainer>
      <I18nextProvider i18n={i18n} >
        <App />
      </I18nextProvider>
    </AppContainer>
  ), document.getElementById('root'));
}

app._plugin.apply('onHmr')(render);

render()

if (module.hot) {
  module.hot.accept('#/router', () => { render(router) })
}






