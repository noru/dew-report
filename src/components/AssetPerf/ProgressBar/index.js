/* @flow */
import React, { Component } from 'react'
import { Progress } from 'antd'

import styles from './styles.scss'

type PropsT = {
  color: string,
  title: string,
  percent: number,
  textDesc: React$Element
}
export default class ProgressBar extends Component<*, PropsT, *> {
  static defaultProps = { color: '#b6b6b6' }

  render () {
    const { color, title, percent, textDesc, ...otherProps } = this.props
    return (
      <div style={{color}} className={styles.progressBar} {...otherProps}>
        <div className={styles.title}>{title}</div>
        <div className={styles.barWrapper}>
          <div style={{width: `${(percent > 1 ? 1 : percent)*100}%`}} className={styles.bar}></div>
        </div>
        <div className={styles.desc}>{textDesc}</div>
      </div>
    )
  }
}
