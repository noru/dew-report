/* @flow */
import React, { PureComponent } from 'react'
import { Table, Icon, Button } from 'antd'
import { connect } from 'dva'

import ConfigGroup from '../ConfigGroup'
import ConfigType from '../ConfigType'

import ProgressBar from '#/components/AssetPerf/ProgressBar'
import { round } from '#/utils'


import styles from './styles.scss'

export default
@connect(state => ({
  groupBy: state.filters.groupBy,
  filterId: state.filters.data[1] ? state.filters.data[1][state.filters.groupBy] : null
}))
class ManualPanel extends PureComponent {
  render () {
    const { config, loading, configed, groupBy, filterId } = this.props
    if (!config || !config.length) return null

    return (
      <div className={styles.manualPanel}>
        <div className="m-b-1 font-small text-muted">手工调节预期增长（基于系统自动预测）</div>
        {
          groupBy === 'type'
          ? <ConfigType {...this.props} onRowClick={record => this.props.dispatch({
            type: 'filters/data/change',
            payload: {
              [record.type]: record.id
            },
            level: 1
          })} config={this.props.config[0]}/>
          : config.map((c, index) => {
            if (index === 0) {
              return <ConfigGroup key="group" onRowClick={record => this.props.dispatch({
                type: 'filters/data/change',
                payload: {
                  [record.type]: record.id
                },
                level: 1
              })} {...this.props} config={c}/>
            }
            if (index === 1) return <ConfigType key={filterId} {...this.props} config={c}/>
          })
        }
        <div className={"m-y-1 text-center " + styles['button-container']}>
          <Button
            size="large"
            type="primary"
            loading={loading}
            style={{width: 120}}
            onClick={this.handleSumbit}>
            确认预期
          </Button>
        </div>
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
