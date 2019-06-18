import React from 'react'
import ProgressBar from '#/components/MaintenanceCost/ProgressBar'
import { connect } from 'dva'
import moment from 'moment'
import { round, withUnit } from '#/utils'
import styles from './index.scss'

class Overview extends React.PureComponent {
  render() {
    const { forecastOverview, filters } = this.props
    const { data, ranges } = forecastOverview
    const { target } = filters
    const keys = target === 'acyman' ? ['labor', 'parts'] : ['repair', 'PM']
    const maxSum = Math.max(...data.map(datum => keys.reduce((prev, cur) => prev + datum[cur], 0)))
    return (
      <div className={styles.overview}>
        <div className={styles['group']}>
          <div className="lead m-b-1">开机率：</div>
          {
            data.length ? ranges.map(([from, to], index) => {
              if(to < moment().startOf('year').format('YYYY-MM-DD')) {
                return <ProgressBar
                  key={index}
                  title={moment(from).format('YYYY') + '年'}
                  percent={data[index].onrate}
                  textDesc={`${round(data[index].onrate * 100)}%`} />
              } else if (to > moment().startOf('year').format('YYYY-MM-DD') && to < moment().endOf('year').format('YYYY-MM-DD')) {
                return <ProgressBar
                  key={index}
                  title={moment(from).format('YYYY') + '年至今'}
                  percent={data[index].onrate}
                  textDesc={`${round(data[index].onrate * 100)}%`} />
              } else {
                return <ProgressBar
                  key={index}
                  color="#46af9b"
                  title={`${moment(from).format('YYYY')}预测`}
                  percent={data[index].onrate}
                  textDesc={`${round(data[index].onrate * 100)}%  ${data[index].onrate - data[index - 2].onrate > 0 ? '+' : ''}${round((data[index].onrate - data[index - 2].onrate) / data[index - 2].onrate * 100, 1)}%`} />
              }
            }) : null
          }
        </div>

        <div className={styles['group']}>
          <div className="lead m-b-1">{target === 'acyman' ? '人力+备件成本:' : '维修＋PM:'}</div>
          {
            data.length ? ranges.map(([from, to], index) => {
              const percent = keys.reduce((prev, cur) => prev + data[index][cur], 0) / maxSum
              if(to < moment().startOf('year').format('YYYY-MM-DD')) {
                return <ProgressBar
                  key={index}
                  title={moment(from).format('YYYY') + '年'}
                  percent={percent}
                  textDesc={`${withUnit(keys.reduce((prev, cur) => prev + data[index][cur], 0))}`} />
              } else if (to > moment().startOf('year').format('YYYY-MM-DD') && to < moment().endOf('year').format('YYYY-MM-DD')) {
                return <ProgressBar
                  key={index}
                  title={moment(from).format('YYYY') + '年至今'}
                  percent={percent}
                  textDesc={`${withUnit(keys.reduce((prev, cur) => prev + data[index][cur], 0))}`} />
              } else {
                const prevPercent = keys.reduce((prev, cur) => prev + data[index - 2][cur], 0) / maxSum
                return <ProgressBar
                  key={index}
                  color="#46af9b"
                  title={`${moment(from).format('YYYY')}预测`}
                  percent={percent}
                  textDesc={`${withUnit(keys.reduce((prev, cur) => prev + data[index][cur], 0))}  ${(percent - prevPercent) > 0 ? '+' : ''}${round((percent - prevPercent) / prevPercent * 100, 1)}%`} />
              }
            }) : null
          }
        </div>
      </div>
    )
  }
}

export default connect(({forecastOverview, filters}) => ({forecastOverview, filters}))(Overview)
