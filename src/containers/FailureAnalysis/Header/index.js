// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { DatePicker } from 'antd'
import SelectHelper from '#/components/common/SelectHelper'
import { getRangePresets } from '#/utils'
import { disabledDate } from '#/constants'
import './header.scss'

const RangePicker = DatePicker.RangePicker
const DatePresets = getRangePresets([
  'oneWeek', 'oneMonth', 'oneYear', 'currentMonth',
  'yearBeforeLast', 'lastYear', 'currentYear'
])

const Ranges = DatePresets.reduce((prev, cur) => {
  prev[cur.text] = [
    cur.start,
    cur.end
  ]
  return prev
}, {})

function mapState2Props(state) {
  let {
    FailureAnalysis: { filterBy, period },
    assetTypes,
    depts,
    hospitals,
  } = state
  return { filterBy, period, name, assetTypes, departments: depts.depts, hospital: depts.selectedHospital, hospitals: depts.hospitals }
}
function mapDispatch2Props(dispatch) {
  return {
    onFilterChange: (type) => (data) => dispatch({ type: 'FailureAnalysis/update/filter', data: { type, data }}),
    onPeriodChange: (data) => dispatch({ type: 'FailureAnalysis/update/period', data }),
    onHospitalChange: (data) => dispatch({ type: 'depts/update/selectedHospital', payload: data.key }),
  }
}

@connect(mapState2Props, mapDispatch2Props)
export class Header extends PureComponent {

  _defaultOption(key) {
    return this.props.t(key)
  }
  _sortOptions() {
    let { t } = this.props
    return [
      {key: 'operation_rate', label: t('operation_rate')},
      {key: 'ftfr', label: t('ftfr')},
      {key: 'incident_count', label: t('incident_count')},
    ]
  }
  _filtersDept() {
    let { t, departments = []} = this.props
    return [
      { key: 'all_dept', label: t('all_dept') },
    ].concat(departments.map(t => ({ key: String(t.id), label: t.name })))

  }
  _filtersAssetType() {
    let { t, assetTypes = [] } = this.props
    return [
      { key: 'all_asset_type', label: t('all_asset_type') },
    ].concat(assetTypes.map(d => ({ key: String(d.id), label: d.name})))
  }

  _filtersHospital() {
    let { t, hospitals = [] } = this.props
    return hospitals.map(d => ({ key: String(d.id), label: d.name}))
  }

  render() {
    let { period, filterBy, hospital, onFilterChange, onPeriodChange, onHospitalChange } = this.props
    return (<nav id="header" className="header level">

      <div className="nav-left">
        <div className="nav-item">
          <RangePicker
            showTime
            format="YYYY-MM-DD"
            ranges={Ranges}
            disabledDate={disabledDate}
            defaultValue={[period.from, period.to]}
            onChange={onPeriodChange}
          />
        </div>
        <div className="nav-item">
          { SelectHelper(filterBy['assettype'], this._filtersAssetType(), onFilterChange('assettype')) }
        </div>
        <div className="nav-item">
          { SelectHelper(hospital, this._filtersHospital(), onHospitalChange) }
        </div>
        <div className="nav-item">
          { SelectHelper(filterBy['dept'], this._filtersDept(), onFilterChange('dept')) }
        </div>
      </div>
    </nav>)
  }
}

export default translate()(Header)