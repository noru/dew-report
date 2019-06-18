// @flow
import React from 'react'
import { connect } from 'dva'
import moment from 'moment'
import FilterBar from 'dew-filterbar'
import StatusBar from 'dew-statusbar'
import { Motion, spring } from 'react-motion'
import Chart from '#/components/ScanDetails/Chart'
import { IsHead } from '#/utils'

import styles from './index.scss'

const isHead = IsHead()

export default
@connect(({ScanDetails_filters, depts, assets, steps, hospitals }) => ({filters: ScanDetails_filters, depts, assets, steps, hospitals}))
class ScanDetails extends React.PureComponent {
  onFilterChange = (e) => this.props.dispatch({
    type: 'ScanDetails_filters/field/set',
    payload: e,
  })

  render() {
    const { filters, depts, assets, hospitals = [], steps } = this.props
    const filterOptions = [
      { type: 'range', key: 'range', value: filters.range }
    ]
    if (isHead) {
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
          allowClear: false,
          dropdownMatchSelectWidth: false,

        },
      )
    }
    return (
      <div className={styles['scan-details']}>
        <FilterBar options={filterOptions} onChange={this.onFilterChange}/>
        <Chart />
        {
          assets.loading || steps.loading
          ?
          <Motion
            defaultStyle={{opacity: 0}}
            style={{opacity: spring(1)}}
          >
            {
              ({opacity}) => (
                <div className={styles['loading-container']} style={{opacity}}>
                  <StatusBar className={styles['loading']} type="loading"/>
                </div>
              )
            }
          </Motion>
          : null
        }
      </div>
    )
  }
}
