import React, { Component } from 'react'
import { connect } from 'dva'
import { Spin, Alert, Tooltip } from 'antd'

import { round } from '#/utils'
import { currentYear } from '#/constants'

import ProgressBar from '#/components//AssetPerf/ProgressBar'


import styles from './styles.scss'

@connect(state => ({
  overview: state.overview.data
}))
export default class SystemPanel extends Component {
  render () {
    const { overview } = this.props
    const revenueRange = overview.slice(0, 4).reduce((prev, cur) => {
      if (cur.revenue < prev[0]) prev[0] = cur.revenue
      if (cur.revenue > prev[1]) prev[1] = cur.revenue
      return prev
    }, [+Infinity, -Infinity])
    const costRange = overview.slice(0, 4).reduce((prev, cur) => {
      if (cur.cost < prev[0]) prev[0] = cur.cost
      if (cur.cost > prev[1]) prev[1] = cur.cost
      return prev
    }, [+Infinity, -Infinity])
    return (
      <div className={styles.systemPanel}>
        <h2>全部设备：</h2>
        <div className={styles['group']}>
          <div className="lead m-b-1">收入预测（百万）：</div>
          {
            Array.isArray(overview)
              ? overview.slice(0, 3).map((n, index) => {
                return <ProgressBar
                  key={index}
                  title={index < 2 ? `${currentYear - 2 + index}年` : `${currentYear}至今`}
                  percent={n.revenue / revenueRange[1]}
                  textDesc={`${round(n.revenue / 1000000)}`} />
              })
              : null
          }
          <ProgressBar
            color="#46af9b"
            title={`${currentYear}预测`}
            percent={overview[3].revenue / revenueRange[1]}
            textDesc={`${round(overview[3].revenue / 1000000, 1)}  ${round(overview[4].revenue_increase * 100, 1)}%`} />
        </div>

        <div className={styles['group']}>
          <div className="lead m-b-1">成本预测（百万）：</div>
          {
            Array.isArray(overview)
              ? overview.slice(0, 3).map((n, index) => {
                return <ProgressBar
                  key={index}
                  title={index < 2 ? `${currentYear - 2 + index}年` : `${currentYear}至今`}
                  percent={n.cost / costRange[1]}
                  textDesc={`${round(n.cost / 1000000)}`} />
              })
              : null
          }
          <ProgressBar
            color="#46af9b"
            title={`${currentYear}预测`}
            percent={overview[3].cost / costRange[1]}
            textDesc={`${round(overview[3].cost / 1000000, 1)}  ${round(overview[4].cost_increase * 100, 1)}%`} />
        </div>
      </div>
    )
  }
}
