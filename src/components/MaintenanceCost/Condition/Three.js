import React, { PureComponent } from 'react'
import { connect } from 'dva'
import EditBlock from 'dew-editblock'
import { THRESHOLD_COLORS } from '#/constants'

import pic from './pic.png'

import styles from './styles.scss'


export default
@connect(({thresholds}) => ({threshold: thresholds[2]}))
class Three extends PureComponent {
  handleChange = index => value => {
    this.props.dispatch({
      type: 'thresholds/set',
      payload: Number(value) / 100,
      i: 2,
      j: index
    })
  }
  render () {
    const { threshold } = this.props
    return (
      <div className={styles.three} style={{color: THRESHOLD_COLORS[2]}}>
        <div>条件3</div>
        <div className={styles['content']}>
          <div className={styles.main}>
            {/* <div className={styles.title}>
              <div>开机率 95%</div>
              <div>开机率 80%</div>
            </div> */}
            {/* <img className={styles.img} src={pic} /> */}
            <div className={styles.content}>
              <EditBlock
                className={styles.block}
                onChange={this.handleChange(0)}
                initialValue={String(threshold[0] * 100)}
                sign="%" />
              <span>&nbsp;&lt; 开机率 &lt;</span>
              <EditBlock
                className={styles.block}
                onChange={this.handleChange(1)}
                initialValue={String(threshold[1] * 100)}
                sign="%" />
            </div>
          </div>
          <div className={styles.main}>
            {/* <div className={styles.title}>
              <div style={{color: THRESHOLD_COLORS[2]}}>购买成本 10%</div>
            </div> */}
            {/* <img className={styles.img} src={pic} /> */}
            <div className={styles.content}>
              <div>
                <div className={styles.content}>
                  <span>人力+备件 &gt; 购买成本</span>
                  <EditBlock
                    className={styles.block}
                    onChange={this.handleChange(2)}
                    initialValue={String(threshold[2] * 100)}
                    sign="%" />
                </div>
                <div className={styles.content}>偏差不超过<EditBlock
                  className={styles.block}
                  onChange={this.handleChange(3)}
                  initialValue={String(threshold[3] * 100)}
                  sign="%" /></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
}
