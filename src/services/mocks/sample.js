import { Orgs, AssetTypes, Hospitals } from './common'
import { Assets } from './assetBrowser'
import { Profit, Forecast, ForecastPUT, ForecastRate } from './assetPerf'
import { StaffPerf } from './staffPerf'
import { DetailByAsset, DetailByStep, Brief } from './scanDetails'
import { Acyman20, TypeAcyman10, TypeAcyman, TypeMtpm, AssetAcyman, AssetMtpm } from './maintenanceCost'
import { PmByAsset, PmByType } from './maintenanceStats'
import { Dmv2 } from './decisionMaking'
import { BriefsByAsset, BriefsByDept, BriefsBySupplier, BriefsByType } from './FailureAnalysis/briefs'
import { Reasons } from './FailureAnalysis/reasons'
import { briefsByType, briefsBySupplier, briefsByDept } from './ProcessAnalysis/briefs'
import { details } from './ProcessAnalysis/details'
import { grossByDept, grossBySupplier, grossByType } from './ProcessAnalysis/gross'
import { phaseArrival, phaseRespond, phaseETTR } from './ProcessAnalysis/phase'
import { Assets as AssetInfo } from './Nurse/assetInfo'
import { URLs } from '../index.js'
import { sampleSize } from 'lodash'
import { assetsInMaintain, avgResponseTime } from './Nurse/assetsInMaintain'

const TAG = '[Mock]: '

let info = msg => console.info(TAG + msg)

export default function (mock) {

  mock.onGet(URLs.AllAssetTypes).reply(function (config) {
    info(config.url)
    return [200, AssetTypes]
  })

  mock.onGet(RegExp(URLs.AllDepartments)).reply(function (config) {
    info(config.url)
    let orgs = JSON.parse(JSON.stringify(Orgs))
    orgs.orgInfos = sampleSize(orgs.orgInfos, 1 + Math.random() * orgs.orgInfos.length | 0)
    return [200, orgs]
  })

  mock.onGet(URLs.AllHospitals).reply(function (config) {
    info(config.url)
    return [200, Hospitals]
  })

  mock.onGet(URLs.AllHospitals).reply(function (config) {
    info(config.url)
    return [200, Hospitals]
  })

  mock.onGet(URLs.AssetBrowser_Assets).reply(function (config) {
    info(config.url)
    return [200, Assets]
  })

  mock.onGet(URLs.AssetPerf_Profit).reply(function (config) {
    info(config.url)
    return [200, Profit]
  })

  mock.onGet(URLs.AssetPerf_Forecast).reply(function (config) {
    info(config.url)
    return [200, Forecast]
  })

  mock.onPut(URLs.AssetPerf_Forecast).reply(function (config) {
    info(config.url)
    return [200, ForecastPUT]
  })

  mock.onGet(URLs.AssetPerf_ForecastRate).reply(function (config) {
    info(config.url)
    return [200, ForecastRate]
  })

  mock.onGet(URLs.StaffPerf_Staff).reply(function (config) {
    info(config.url)
    return [200, StaffPerf]
  })

  mock.onGet(URLs.ScanDetails_Brief).reply(function (config) {
    info(config.url)
    return [200, Brief]
  })

  mock.onGet(URLs.ScanDetails_Detail).reply(function ({ params, url }) {
    info(url)
    if (params.groupby === 'asset') {
      return [200, DetailByAsset]
    } else {
      return [200, DetailByStep]
    }
  })

  mock.onGet(URLs.MaintenanceCost_Ma).reply(function ({ params, url }) {
    info(url)
    let resp
    if (params.limit == 20) {
      resp = Acyman20
    } else if (params.limit == 10 && params.groupby === 'type') {
      resp = TypeAcyman10
    } else if (params.rltgrp === 'mtpm') {
      resp = TypeMtpm
    } else if (params.rltgrp === 'acyman' && params.groupby === 'type') {
      resp = TypeAcyman
    }

    return [200, resp]
  })

  mock.onGet(RegExp(URLs.MaintenanceCost_Asset)).reply(function ({ params, url }) {
    info(url)
    if (params.rltgrp === 'acyman') {
      return [200, AssetAcyman]
    } else {
      return [200, AssetMtpm]
    }
  })

  mock.onGet(URLs.MaintenanceStats_Pm).reply(function({ params, url }) {
    info(url)
    if (params.groupby === 'asset') {
      return [200, PmByAsset]
    } else {
      return [200, PmByType]
    }
  })

  mock.onGet(URLs.DecisionMaking_Dmv2).reply(function({ params, url }) {
    info(url)
    return [200, Dmv2]
  })

  mock.onGet(URLs.FailureAnalysis_Brief)
    .reply(function (config) {
      info(config.url)
      let params = config.params
      switch (params.groupby) {
        case 'type':
          return [200, simulatePaging(params.limit, params.start, BriefsByType)]
        case 'dept':
          return [200, simulatePaging(params.limit, params.start, BriefsByDept)]
        case 'asset':
          return [200, simulatePaging(params.limit, params.start, BriefsByAsset)]
        case 'supplier':
          return [200, simulatePaging(params.limit, params.start, BriefsBySupplier)]
      }
      return [200, []]
    })

  mock.onGet(URLs.FailureAnalysis_Reasons)
    .reply(function (config) {
      info(config.url)
      return [200, Reasons]
    })

  mock.onGet(URLs.ProcessAnalysis_Brief)
    .reply(function (config) {
      info(config.url)
      let params = config.params
      switch (params.groupby) {
        case 'type':
          return [200, paSimulatePaging(params.limit, params.start, briefsByType)]
        case 'dept':
          return [200, paSimulatePaging(params.limit, params.start, briefsByDept)]
        default: // 'supplier'
          return [200, paSimulatePaging(params.limit, params.start, briefsBySupplier)]
      }
    })

  mock.onGet(URLs.ProcessAnalysis_Detail)
    .reply(function (config) {
      info(config.url)
      let params = config.params
      return [200, paSimulatePaging(params.limit, params.start, details)]
    })

  mock.onGet(URLs.ProcessAnalysis_Gross)
    .reply(function (config) {
      info(config.url)
      let params = config.params
      switch (params.groupby) {
        case 'type':
          return [200, grossByType]
        case 'dept':
          return [200, grossByDept]
        default: // 'supplier'
          return [200, grossBySupplier]
      }
    })
  mock.onGet(URLs.ProcessAnalysis_Phase)
    .reply(function (config) {
      info(config.url)
      let params = config.params
      switch (params.phase) {
        case 'ETTR':
          return [200, phaseETTR]
        case 'arrived':
          return [200, phaseArrival]
        default: // respond
          return [200, phaseRespond]
      }
    })

  mock.onGet(URLs.Nurse_Assets)
    .reply(function(config) {
      info(config.url)
      return [ 200, AssetInfo ]
    })
  mock.onGet(URLs.Nurse_AssetsInMaintain)
    .reply(config => {
      info(config.url)
      return [200, assetsInMaintain]
    })
  mock.onGet(URLs.Nurse_responseTime)
    .reply(config => {
      info(config.url)
      return [200, avgResponseTime]
    })
  mock.onAny().passThrough()

}

function simulatePaging(top, skip = 0, resp) {

  let result = resp.briefs.slice(skip, skip + top)
  return {
    pages: {
      total: resp.briefs.length,
      start: skip,
      limit: Math.max(result.length, top)
    },
    briefs: result
  }
}

function paSimulatePaging(top, skip = 0, resp) {

  let result = resp.data.slice(skip, skip + top)

  return {
    page: {
      total: resp.data.length,
      start: skip,
      limit: Math.min(result.length, top)
    },
    data: result
  }
}