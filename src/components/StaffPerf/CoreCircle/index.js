import React, { PureComponent } from 'react'
import StarRate from '../StarRate'

import StatusBar from 'dew-statusbar'

import { round } from '#/utils'
import { ORDER, HOUR, RATE } from '#/constants'

import styles from './styles.scss'

type PropsT = {
  focus: Object,
  range: Object,
  onClick: Function
}

class PercentText extends PureComponent {
  render () {
    const { title, numerator, denominator, tip = '工作小时' } = this.props
    return (
      <div>
        <span>{title}</span>
        <span>&nbsp;{numerator} / {denominator}</span>
        <span>&nbsp;({tip})</span>
        {
          denominator
            ? <span>&nbsp;= {round(numerator * 100 / denominator)} %</span>
            : null
        }
      </div>
    )
  }
}

export default class CoreCircle extends PureComponent<*, PropsT, *> {
  render () {
    const { loading } = this.props
    
    if (loading) return <StatusBar type="loading" />

    return (
      <div className={styles.coreCircle}>
        {this.renderContent()}
      </div>
    )
  }

  renderContent () {
    const { filter, focus, range, onClick } = this.props

    if (!focus || !range) return null
    
    return (
      <div className={styles.content}>
        <div className="m-b-1">{focus.owner_name}</div>
        <div className={styles.info}>
          <div className="m-b-1" style={{opacity: filter === HOUR ? 1 : 0.3}}>
            <div
              className="clickable flex flex--align-items--center"
              onClick={onClick(HOUR)}>
              <div className={styles.rect} style={{color: 'rgb(106,180,166)'}}></div>
              <PercentText {...{
                title: '工作量',
                tip: '法定小时',
                numerator: focus.man_hour,
                denominator: (focus.id ? range.man_hour : range.hour_total)
              }} />
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: 'rgb(106,180,166)'}}></div>
              <PercentText {...{
                title: '维修',
                numerator: focus.repair,
                denominator: focus.man_hour
              }} />     
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: 'rgb(123,190,178)'}}></div>
              <PercentText {...{
                title: '保养',
                numerator: focus.maintenance,
                denominator: focus.man_hour
              }} />
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: 'rgb(135,203,190)'}}></div>
              <PercentText {...{
                title: '计量',
                numerator: focus.meter,
                denominator: focus.man_hour
              }} />       
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: 'rgb(154,201,192)'}}></div>
              <PercentText {...{
                title: '巡检',
                numerator: focus.inspection,
                denominator: focus.man_hour
              }} />
            </div>
          </div>
          <div
            className="clickable m-b-1 flex flex--align-items--center"
            style={{opacity: filter === RATE ? 1 : 0.3}}
            onClick={onClick(RATE)}>
            <div className={styles.rect} style={{color: '#d6c25e'}}></div>
            <div className="m-r-3">满意度</div>
            <StarRate total={range.score} value={focus.score} />
            <div className="m-l-1">{round(focus.score)} 分</div>
          </div>
          <div style={{opacity: filter === ORDER ? 1 : 0.3}}>
            <div
              className="clickable flex flex--align-items--center"
              onClick={onClick(ORDER)}>
              <div className={styles.rect} style={{color: '#bb81b8'}}></div>
              <div>工单数量 {focus.work_order} 个</div>
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: '#bb81b8'}}></div>
              <div>已完成 {focus.closed} 个</div>
            </div>
            <div className="m-l-2 flex flex--align-items--center">
              <div className={styles.rect} style={{color: '#896089'}}></div>
              <div>未完成 {focus.open} 个</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
