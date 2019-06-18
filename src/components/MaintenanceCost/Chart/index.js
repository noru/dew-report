import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { times } from 'lodash'
import FilterBar from 'dew-filterbar'
import Groups from './Groups'
import Assets from './Assets'
import AssetsForecast from './AssetsForecast'
import Center from './Center'
import Analysis from './Analysis'
import Loading from './Loading'
import styles from './index.scss'

const assets = times(20, index => ({
  id: index,
  name: 'asset ' + index,
  "laber": Math.random() * 200,
  "parts": Math.random() * 300
}))

const assetsPredict = times(20, index => ({
  id: index,
  name: 'asset ' + index,
  "laber": Math.random() * 200,
  "parts": Math.random() * 300,
  color: ['#82b1d1', '#d5c165', '#ce82b4'][~~(Math.random() * 3)]
}))


class Chart extends React.PureComponent {
  onFilterChange = e => {
    const { key, value } = e
    if (key === 'range' && typeof value === 'string') {
      this.props.dispatch({
        type: 'MaintenanceCost_filters/field/set',
        payload: {
          key,
          value: {
            from: `${value}-01-01`,
            to: `${value}-12-31`
          }
        }
      })
    } else {
      this.props.dispatch({
        type: 'MaintenanceCost_filters/field/set',
        payload: e
      })
    }
  }
  render() {
    const { filters, depts, assetTypes } = this.props
    // let filterOptions = [{type: 'radio', key: 'type', value: filters.type, options: [{id: 'history', name: '历史'}, {id: 'forecast', name: '预测'}]}]
    // if (filters.type === 'history') {
    //   filterOptions.push({
    //     type: 'range',
    //     key: 'range',
    //     value: filters.range
    //   })
    // } else {
    //   const curYear = new Date().getFullYear()
    //   filterOptions.push({
    //     type: 'select',
    //     key: 'range',
    //     value: filters.range.from ? new Date(filters.range.from).getFullYear() : curYear,
    //     options: [
    //       {id: curYear, name: `${curYear}年预测`},
    //       {id: curYear + 1, name: `${curYear + 1}年预测`}
    //     ],
    //     allowClear: false
    //   })
    // }
    let filterOptions = []
    filterOptions.push({
      type: 'range',
      key: 'range',
      value: filters.range
    })
    if (depts.depts) {
      filterOptions.push(
        {
          type: 'select',
          key: 'hospital',
          value: depts.selectedHospital,
          options: depts.hospitals,
          dropdownMatchSelectWidth: false,
          allowClear: false,
        },
        {
          type: 'select',
          key: 'dept',
          value: filters.dept,
          options: depts.depts,
          placeholder: '全部科室',
          dropdownMatchSelectWidth: false,
          allowClear: false,
        })
      }
      filterOptions.push({
        type: 'select',
        key: 'assetType',
        value: filters.assetType,
        options: assetTypes,
        placeholder: '全部设备类型',
        dropdownMatchSelectWidth: false,
      })

    return (
      <div className={styles['chart']}>
        <FilterBar options={filterOptions} onChange={this.onFilterChange}/>
        {
          filters.type === 'history'
          ?
          <div className={styles['history']}>
            <Groups className={styles['groups']} />
            <Assets className={styles['assets']} />
            <Center />
          </div>
          :
          <div className={styles['forecast']}>
            <div className={styles['left']}>
              <Groups className={styles['groups']} />
              <AssetsForecast className={styles['assets-forecast']}  />
              <Center />
            </div>
            <div className={styles['right']}>
              <Analysis/>
            </div>
          </div>
        }
        <Loading />
      </div>
    )
  }
}

export default connect(({MaintenanceCost_filters, depts, assetTypes}) => ({filters: MaintenanceCost_filters, depts, assetTypes}))(Chart)
