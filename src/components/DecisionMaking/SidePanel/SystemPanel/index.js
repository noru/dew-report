import React, { Component } from 'react'
import { connect } from 'dva'
import { Spin, Alert, Tooltip } from 'antd'

import { round, isSameCursor } from '#/utils'
import { currentYear } from '#/constants'

import ProgressBar from '#/components/DecisionMaking/ProgressBar'

import Suggestions from '../Suggestions'

import styles from './styles.scss'

const statusTips = [
  {
    text: '使用率预测超负荷台数',
    icon: 'dewicon-circle-full'
  },
  {
    text: '使用率预测低负荷台数',
    icon: 'dewicon-circle-low'
  }
]

@connect(state => ({
  year: state.finance.query.year
}))
export default class SystemPanel extends Component {
  render () {
    const { data, year } = this.props
    if (!data) return null
    return (
      <div className={styles.systemPanel}>
        <div className="lead m-b-1">当前位置: {data.name}</div>
        {
          Array.isArray(data.historical_data)
            ? data.historical_data.map(n => {
              return <ProgressBar
                key={n.year}
                className={styles['muted-progress']}
                title={`${n.year}${n.year === currentYear ? '至今' : '年' }`}
                percent={n.usage}
                textDesc={`${round(n.usage * 100, 1)}%`} />
            })
            : null
        }
        <ProgressBar
          className={styles['progress']}
          title={`${year}预测`}
          percent={data.usage_predict}
          textDesc={`
            ${round(data.usage_predict * 100, 1)}%
            ${round(data.usage_predict_increase * 100, 1)}%
          `} />
        {
          Array.isArray(data.usage_sum)
            ? <div className={styles.statusTips}>
              {
                data.usage_sum.slice().reverse().map((n, i) => {
                  const { text, icon } = statusTips[i]
                  return <div key={i} className={styles.statusTip}>
                    <div>{text}</div>
                    <i className={`dewicon ${icon}`}></i>
                    <div className="lead">{n}台</div>
                  </div>
                })
              }
            </div>
            : null
        }
        {
          Array.isArray(data.suggestions) && data.suggestions.length
            ? <div className={styles.suggestions}>
              <Suggestions data={data} />
            </div>
            : null
        }
        <div className={styles.legend}>
          <div className="lead">使用率负荷说明</div>
          <div className="flex flex--align-items--center">
            <i className="dewicon dewicon-circle-high"></i>
            <span className="m-l-1">平均使用率预测</span>
          </div>
          <Tooltip placement="topLeft" title="您可以自定义使用率大于多少为满负荷">
            <div className="flex flex--align-items--center">
              <i className="dewicon dewicon-circle-full"></i>
              <span className="m-l-1">满负荷使用率</span>
            </div>
          </Tooltip>
          <Tooltip placement="topLeft" title="您可以自定义使用率小于多少为低负荷">
            <div className="flex flex--align-items--center">
              <i className="dewicon dewicon-circle-low"></i>
              <span className="m-l-1">低负荷使用率</span>
            </div>
          </Tooltip>
          <div>球大小与设备利润预测相关</div>
          <div>左侧的图形显示的是您选择的预测年份的数据</div>
        </div>
      </div>
    )
  }
}
