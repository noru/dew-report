/* @flow */
import React, { PureComponent } from 'react'
import { arc } from 'd3-shape'

import styles from './styles.scss'

type PropsT = {
  innerRadius: number,
  outerRadius?: number,
  startAngle: number,
  endAngle: number,
  color?: string
}

export default class ArcBar extends PureComponent<void, PropsT, void> {
  render() {
    const {
      innerRadius, outerRadius,
      startAngle, endAngle,
      width, color,
      ...restProps
    } = this.props

    const d = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)()

    return (
      <path className={styles.path} fill={color} d={d} {...restProps} />
    )
  }
}
