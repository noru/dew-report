/* @flow */
import React, { Component } from 'react'

import styles from './styles.scss'

const statusSet = {
  empty: {
    icon: 'fa fa-inbox',
    desc: '暂无可用设备数据'
  },
  error: {
    icon: 'fa fa-exclamation-circle',
    desc: '数据加载出错，请尝试刷新页面'
  },
  loading: {
    icon: 'fa fa-spinner',
    desc: '数据加载中...'
  }
}

type PropT = {
  type: string
}

export default class StatusBar extends Component<*, PropT, *> {
  render () {
    const { type } = this.props
    if (!type) return null
    const suit = statusSet[type]
    if (!suit) return null
    return (
      <div className={styles.statusBar}>
        <i className={`${suit.icon} ${styles.icon} ${styles[type]}`}></i>
        <div className={styles.desc}>{suit.desc}</div>
      </div>
    )
  }
}
