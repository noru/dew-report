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
    ProcessAnalysis: { filterBy, orderBy, period },
    assetTypes,
    depts,
    hospitals,
  } = state
  return { filterBy, orderBy, period, departments: depts.depts, hospital: depts.selectedHospital, hospitals: depts.hospitals, assetTypes }
}
function mapDispatch2Props(dispatch) {
  return {
    onFilterChange: (type) => (data) => dispatch({ type: 'ProcessAnalysis/update/filter', data: { type, data } }),
    onPeriodChange: (data) => dispatch({ type: 'ProcessAnalysis/update/period', data }),
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
      { key: 'response_time', label: t('response_time') },
      { key: 'ettr', label: t('ettr') },
      { key: 'arrival_time', label: t('arrival_time') },
      { key: 'composite_order', label: t('composite_order') },
    ]
  }
  _filtersDept() {
    let { t, departments = [] } = this.props
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
    let { period, filterBy, hospital,
      onFilterChange, onPeriodChange, onHospitalChange
    } = this.props
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