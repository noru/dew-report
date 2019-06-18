import React from 'react'
import { connect } from 'dva'
import classnames from 'classnames'
import { round, withUnit } from '#/utils'
import styles from './index.scss'
import Ellipsus from 'ellipsus'

type Props = {
  filters: any,
  overview: any
}

class Center extends React.PureComponent<*, Props, *> {
  static getIncrease(now, past) {
    if (!past) return ''
    return ((now - past) / past * 100).toFixed(1) + '%'
  }
  toggleTarget = target => e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/field/set',
      payload: {
        key: 'target',
        value: target
      }
    })
  }
  render() {
    const { filters, overview } = this.props
    const { cursor, target } = filters
    return (
      <div className={styles['center']}>
        <h4 className={styles['center-title']}><Ellipsus>{cursor[1] ? (overview.data.name || '') : cursor[0] ? '汇总' : '全部选中设备'}</Ellipsus></h4>
        <span className={styles['center-subtitle']}>单位: 元</span>
        <table className={styles['cost']} onClick={this.toggleTarget('acyman')} data-active={target === 'acyman'}>
          <thead>
            <tr>
              <th></th>
              <th>选中时段</th>
              <th>上一年同时段</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={classnames(styles['with-rect'], styles['labor'])}>按成本类型</td>
              <td>{withUnit(overview.data.labor + overview.data.parts)}</td>
              <td>{withUnit(overview.pastData.labor + overview.pastData.parts)}</td>
            </tr>
            <tr>
              <td className={classnames(styles['with-rect'], styles['labor'])}>人力</td>
              <td>{withUnit(overview.data.labor)}</td>
              <td>{withUnit(overview.pastData.labor)}</td>
            </tr>
            <tr>
              <td className={classnames(styles['with-rect'], styles['parts'])}>备件</td>
              <td>{withUnit(overview.data.parts)}</td>
              <td>{withUnit(overview.pastData.parts)}</td>
            </tr>
          </tbody>
        </table>
        <table className={styles['wo']} onClick={this.toggleTarget('mtpm')} data-active={target === 'mtpm'}>
          <thead>
            <tr>
              <th></th>
              <th>选中时段</th>
              <th>上一年同时段</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={classnames(styles['with-rect'], styles['repair'])}>按派工单类型</td>
              <td>{withUnit(overview.data.repair + overview.data.PM)}</td>
              <td>{withUnit(overview.pastData.repair + overview.pastData.PM)}</td>
            </tr>
            <tr>
              <td className={classnames(styles['with-rect'], styles['repair'])}>维修</td>
              <td>{withUnit(overview.data.repair)}</td>
              <td>{withUnit(overview.pastData.repair)}</td>
            </tr>
            <tr>
              <td className={classnames(styles['with-rect'], styles['PM'])}>PM</td>
              <td>{withUnit(overview.data.PM)}</td>
              <td>{withUnit(overview.pastData.PM)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect(({ MaintenanceCost_filters, MaintenanceCost_overview }) => ({ filters: MaintenanceCost_filters, overview: MaintenanceCost_overview }))(Center)
