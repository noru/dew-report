/* @flow */
import React, { PureComponent } from 'react'
import { Table, Icon, Button } from 'antd'

import ConfigDept from '../ConfigDept'
import ConfigType from '../ConfigType'

import ProgressBar from '#/components/DecisionMaking/ProgressBar'
import { round } from '#/utils'

import Suggestions from '../Suggestions'

import styles from './styles.scss'

export default class ManualPanel extends PureComponent {
  render () {
    const { config, focus: { node }, loading, configed } = this.props
    if (!config || !config.length) return null
    if (!focus) return null

    const root = config[0]
    const { depth, height } = root
    const visibleConfig = config.filter(n => !~[depth, height].indexOf(n.depth))

    const depths = visibleConfig.map(n => n.depth)
    .filter((n, index, arr) => arr.indexOf(n) === index)
    return (
      <div className={styles.manualPanel}>
        <div className="lead m-b-1">使用率预测</div>
        <div className="m-b-1 font-small text-muted">基于系统自动预测的增长进行手工调节</div>
        {
          depths.length === 2
            ? <ConfigDept depths={depths} setFocus={this.handleSetFocus} {...this.props} />
            : null
        }
        {
          depths.length === 1
            ? <ConfigType depths={depths} setFocus={this.handleSetFocus} {...this.props} />
            : null
        }
        <div className="m-y-1 text-center">
          <Button
            size="large"
            type="primary"
            loading={loading}
            style={{width: 120}}
            onClick={this.handleSumbit}>
            确认预期
          </Button>
        </div>
        {
          configed && node
            ? this.renderFocusInfo(node.data)
            : null
        }
      </div>
    )
  }

  renderFocusInfo = (data: Object) => {
    return (
      <div className={styles.focusInfo}>
        <div className="lead m-b-1">当前位置: {data.name}</div>
        <div>根据预期增长产生的使用率预测</div>
        <ProgressBar
          className={styles['progress']}
          title="预测"
          percent={data.usage_predict}
          textDesc={`
            ${round(data.usage_predict * 100, 1)}%
            ${round(data.usage_predict_increase * 100, 1)}%
          `} />
        {
          Array.isArray(data.suggestions) && data.suggestions.length
            ? <div className={styles.suggestions}>
              <Suggestions data={data} />
            </div>
            : null
        }
      </div>
    )
  }

  handleSumbit = () => {
    new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'config/changes/submit',
        resolve,
        reject
      })
    }).then(this.props.markConfiged)
  }

  handleSetFocus = cursor => {
    this.props.dispatch({
      type: 'focus/cursor/set',
      payload: cursor
    })
  }
}
