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
/* Process Analysis */
import processAnalysis from '#/models/ProcessAnalysis'
/* Failure Analysis */
import failureAnalysis from '#/models/FailureAnalysis'
/* Nurse station */
import Nurse from '#/models/Nurse'

const historyEngine = useRouterHistory(createHashHistory)({
  queryKey: false,
  basename: '/',
})
const app = dva({
  history: historyEngine,
  onError: e => {
    if (process.env.NODE_ENV === 'production') return
    console.log(e)
  },
})

/** Common */
app.model(user)
app.model(assetTypes)
app.model(depts)

/* Process Analysis */
app.model(processAnalysis)
/* Failure Analysis */
app.model(failureAnalysis)
/* Nurse station */
app.model(Nurse)

app.router(router)

function render(router) {
  const App = router ? app._getProvider(router) : app.start()
  ReactDOM.render(
    <AppContainer>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </AppContainer>,
    document.getElementById('root')
  )
}

app._plugin.apply('onHmr')(render)

render()

if (module.hot) {
  module.hot.accept('#/router', () => {
    render(router)
  })
}
