import React, { PureComponent } from 'react'
import { connect } from 'dva'
import EditBlock from 'dew-editblock'
import { THRESHOLD_COLORS } from '#/constants'

import pic from './pic.png'

import styles from './styles.scss'

export default
@connect(({thresholds, MaintenanceCost_filters}) => ({threshold: thresholds[1], target: MaintenanceCost_filters.target}))
class Two extends PureComponent {
  handleChange = index => value => {
    this.props.dispatch({
      type: 'thresholds/set',
      payload: Number(value) / 100,
      i: 1,
      j: index
    })
  }
  render () {
    const { threshold } = this.props
    return (
      <div className={styles.wrapper} style={{color: THRESHOLD_COLORS[1]}}>
        <div className={styles.title}>
          <div>条件2</div>
          {/* <div>购买成本 10%</div> */}
        </div>
        {/* <img className={styles.img} src={pic} /> */}
        <div className={styles.content}>
          <span>人力+备件 &gt; 购买成本</span>
          <EditBlock
            className={styles.block}
            onChange={this.handleChange(0)}
            initialValue={String(threshold[0] * 100)}
            sign="%" />
        </div>
      </div>
    )
  }
}
