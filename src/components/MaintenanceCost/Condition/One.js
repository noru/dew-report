import React, { PureComponent } from 'react'
import { connect } from 'dva'
import EditBlock from 'dew-editblock'
import { THRESHOLD_COLORS } from '#/constants'

import pic from './pic.png'

import styles from './styles.scss'


export default
@connect(({thresholds}) => ({threshold: thresholds[0]}))
class One extends PureComponent {
  handleChange = index => value => {
    this.props.dispatch({
      type: 'thresholds/set',
      payload: Number(value) / 100,
      i: 0,
      j: index
    })
  }

  render () {
    const { threshold } = this.props
    return (
      <div className={styles.wrapper} style={{color: THRESHOLD_COLORS[0]}}>
        <div className={styles.title}>
          <div>条件1</div>
          {/* <div>开机率 95%</div>
          <div>开机率 80%</div> */}
        </div>
        {/* <img className={styles.img} src={pic} /> */}
        <div className={styles.content}>
          <span>开机率 &lt;</span>
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
