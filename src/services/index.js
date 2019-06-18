import './interceptors'
import axios from 'axios'
import { load } from './mocks/helper'
import { ReasonConv, BriefConv, BriefAssetConv } from '#/utils/converters'

const URLs = {

  AllDepartments: '/api/org/dept',
  AllAssetTypes: '/api/msg?type=assetGroup',
  AllHospitals: '/api/org/allOrg',

  AssetBrowser_Assets: '/api/assets',

  AssetPerf_Profit: '/api/profit',
  AssetPerf_Forecast: '/api/profit/forecast',
  AssetPerf_ForecastRate: '/api/profit/forecastrate',

  StaffPerf_Staff: '/api/staff',

  ScanDetails_Detail: '/api/scan/detail',
  ScanDetails_Brief: '/api/scan/brief',

  MaintenanceCost_Ma: '/api/ma', // wtf is 'ma' ???
  MaintenanceCost_Asset: '/api/ma/asset/*',

  MaintenanceStats_Pm: '/api/pm', // wtf is 'pm' ???

  FailureAnalysis_Brief: '/api/fa/briefs',
  FailureAnalysis_Reasons: '/api/fa/reasons',

  DecisionMaking_Dmv2: '/api/dmv2',

  ProcessAnalysis_Brief: '/api/process/brief',
  ProcessAnalysis_Detail: '/api/process/detail',
  ProcessAnalysis_Gross: '/api/process/gross',
  ProcessAnalysis_Phase: '/api/process/phase',

  Nurse_Assets: '/gateway/hcapmassetservice/api/apm/asset/assetinfos',
  Nurse_AssetsInMaintain: '/gateway/hcapmreportservice/api/apm/report/nurseSite/assetsInMaintain',
  Nurse_ResponseTime: '/gateway/hcapmreportservice/api/apm/report/nurseSite/avgResponseTime',

}

if (process.env.NODE_ENV !== 'production') {
  Object.keys(URLs).forEach(k => {
    // special treatment for legacy api
    if (URLs[k].indexOf('/api') === 0) {
      URLs[k] = '/geapm' + URLs[k]
    }
  })
}

const UseMock = true
if (__USE_MOCK__ && UseMock) {
  load('./sample')
}

const AssetBrowser = {

  getAssets(params) {
    return axios.get(URLs.AssetBrowser_Assets, { params })
  },

}

const FailureAnalysis = {
  getBriefs(type, state, lastYear) {
    let params = mapParamsToQuery(state, type)
    if (params.key) {
      params.start = 0
    }
    if (lastYear) {
      params.from = minusOneYear(state.period.from)
      params.to = minusOneYear(state.period.to)
    }
    if (type === 'left') {
      return axios.get(URLs.FailureAnalysis_Brief, {params})
        .then(resp => BriefConv(resp, params.dataType, lastYear))
    } else {
      params.groupby = 'asset'
      return axios.get(URLs.FailureAnalysis_Brief, {params})
        .then(resp => BriefAssetConv(resp, params.dataType, lastYear))
    }
  },
  getReasons(state, { type, asset, supplier, dept }) {
    let { period: { from, to }, filterBy, hospital } = state
    let params = {
      from: formatDate(from),
      to: formatDate(to),
      type: filterBy.assettype === 'all_asset_type' ? type : filterBy.assettype,
      dept: filterBy.dept === 'all_dept' ? dept : filterBy.dept,
      hospital: hospital,
      supplier: supplier,
      asset: asset,
    }
    return axios.get(URLs.FailureAnalysis_Reasons, {params}).then(ReasonConv)
  },
}

const ProcessAnalysis = {

  getBriefs(params) {
    return axios.get(URLs.ProcessAnalysis_Brief, { params }).then(_ => _.data)
  },
  getDetails(params) {
    return axios.get(URLs.ProcessAnalysis_Detail, { params }).then(_ => _.data)
  },
  getGross(params) {
    return axios.get(URLs.ProcessAnalysis_Gross, { params }).then(_ => _)
  },
  getPhase(params) {
    return axios.get(URLs.ProcessAnalysis_Phase, { params }).then(_ => {
      _.data.nodes = [0, params.t1, params.t2, params.tmax, Infinity ]
      return _.data
    })
  }
}

const Nurse = {

  getAssets() {
    let params = { page: 0, pageSize: 20000 }
    return axios.get(URLs.Nurse_Assets, { params }).then(_ => _.data)
  },

  getAssetsInMaintain() {
    let params = { page: 0, pageSize: 20000 }
    return axios.get(URLs.Nurse_AssetsInMaintain, { params })
  },

  getAvgResponseTime() {
    return axios.get(URLs.Nurse_ResponseTime)
  },

}

export { URLs, AssetBrowser, ProcessAnalysis, FailureAnalysis, Nurse }

/* Failure Analysis & Process Analysis */
const DateFormat = 'YYYY-MM-DD'
const GroupBy = {
  'display_brand': 'supplier',
  'display_asset_type': 'type',
  'display_dept': 'dept',
}
export const DataTypeMapping = {
  'operation_rate': 'avail',
  'ftfr': 'ftfr',
  'incident_count': 'fix',
  'response_time': 'respond',
  'ettr': 'ETTR',
  'arrival_time': 'arrived'
}

function formatDate(date) {
  if (typeof date === 'string') {
    date = moment(date)
  }
  return date.format(DateFormat)
}

function mapParamsToQuery(params, type) {
  let pag = params.pagination[type]
  let filterBy = params.filterBy
  let assetType = filterBy.assettype === 'all_asset_type' ? '' : filterBy.assettype
  let dept = filterBy.dept === 'all_dept' ? '' : filterBy.dept
  let supplier = filterBy.supplier === 'all_supplier' ? '' : filterBy.supplier
  let hospital = filterBy.hospital === 'default_hospital' ? '' : filterBy.hospital
  return {
    from: formatDate(params.period.from),
    to: formatDate(params.period.to),
    groupby: GroupBy[params.display],
    orderby: DataTypeMapping[params.dataType],
    type: assetType,
    dept: dept,
    hospital: params.hospital,
    start: pag.skip || 0,
    limit: pag.top,
    supplier: supplier,
    dataType: DataTypeMapping[params.dataType],
    key: params.keys
  }
}

function minusOneYear(date) {
  if (typeof date === 'string') {
    date = moment(date)
  }
  return date.clone().subtract('1', 'years').format(DateFormat)
}