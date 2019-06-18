import React, { PureComponent } from 'react'

import styles from './styles.scss'

const fontSize = 18

class Star extends PureComponent {
  render () {
    return <span style={{fontSize}} className={styles.star}>★</span>
  }
}

export default class StarRate extends PureComponent {
  render () {
    const { total, value } = this.props
    return (
      <div className={styles.rateWrapper} style={{width: fontSize * total }}>
        <div className={styles.rate} style={{width: `${value / total * 100}%`}}>
          {
            Array(total).fill(0).map((n, i) => <Star key={i} />)
          }
        </div>
        <div className={styles.rateBg}>
          {
            Array(total).fill(0).map((n, i) => <Star key={i} />)
          }
        </div>        
      </div>
    )
  }
}
