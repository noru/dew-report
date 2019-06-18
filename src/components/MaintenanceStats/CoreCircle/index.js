import React, { PureComponent } from 'react'
import StatusBar from 'dew-statusbar'
import { Circle } from 'rc-progress'

import { COMPLETION, QUALITY, purple, prasinous, gray } from '#/constants'
import { round } from '#/utils'

import styles from './styles.scss'

class ProgressBar extends PureComponent {
  render () {
    const { percent, color, ...restProps } = this.props
    return (
      <Circle
        style={{width: 170, height: 170}}
        percent={percent}
        trailColor={gray}
        trailWidth="6"
        strokeWidth="6"
        strokeColor={color}
        strokeLinecap="square"
        {...restProps} />
    )
  }
}

class Completion extends PureComponent {
  render () {
    const { switcher, info, onClick } = this.props
    const { due, completed, all } = info
    const percent = all ? round(completed / all * 100) : 0

    return (
      <div
        className={styles.wrapper}
        onClick={onClick(COMPLETION)}
        style={{opacity: switcher === COMPLETION ? 1 : 0.3 }}>
        <ProgressBar percent={percent} color={purple} />
        <div className={`${styles.info} text-center`}>
          <div>保养完成率</div>
          <h3>{percent}%</h3>
          <div>逾期未完成: {due}个</div>
          <div>完成保养: {completed}个</div>
          <div>所有保养: {all}个</div>
        </div>
      </div>
    )
  }
}

class Quality extends PureComponent {
  render () {
    const { switcher, info, onClick } = this.props
    const { repair, all } = info
    const percent = all ? round(repair / all * 100) : 0

    return (
      <div
        className={styles.wrapper}
        onClick={onClick(QUALITY)}
        style={{opacity: switcher === QUALITY ? 1 : 0.3 }}>
        <ProgressBar percent={percent} color={prasinous} />
        <div className={`${styles.info} text-center`}>
          <div>保养质量</div>
          <h3>{percent}%</h3>
          <div>未返修保养: {repair}个</div>
          <div>所有保养: {all}个</div>
          <div>(PM30)</div>
        </div>
      </div>
    )
  }
}

type PropsT = {
  focus: Object,
  loading: boolean,
  switcher: string,
  onClick: Function
}

export default class CoreCircle extends PureComponent<*, PropsT, *> {
  render () {
    const { loading, focus, ...restProps } = this.props
    if (loading) return <StatusBar type="loading" />
    if (!focus) return null
    const completion = focus[COMPLETION]
    const quality = focus[QUALITY]
    if (!completion || !quality) return null

    return (
      <div className={styles.coreCircle}>
        <h5>{focus.name || '未命名'}</h5>
        <Completion info={completion} {...restProps} />
        <Quality info={quality} {...restProps} />
      </div>
    )
  }
}
