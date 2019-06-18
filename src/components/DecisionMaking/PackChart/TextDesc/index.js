/* @flow */
import React, { PureComponent } from 'react'

import { round } from '#/utils'

import styles from './styles.scss'

function createMarkup (markup) {
  return {__html: markup}
}

export default class TextDesc extends PureComponent {
  render () {
    const { label, percent, overload } = this.props
    return <g>
      <text className={styles.font10}>
        <tspan className={styles.icon}>{label}</tspan>
      </text>
      <text y="1.1em" className={styles.font8}>
        <tspan className={styles.iconLoad} dangerouslySetInnerHTML={createMarkup('&#xE003')}></tspan>
        <tspan dx="0.3em">{round(percent * 100)}%</tspan>
      </text>
      {
        overload
          ? <text y="2.1em" className={styles.font8}>
            <tspan className={styles.iconDanger} dangerouslySetInnerHTML={createMarkup('&#xE002')}></tspan>
            <tspan dx="0.3em">{overload}</tspan>
          </text>
          : null
      }
    </g>
  }
}
