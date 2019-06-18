import React from 'react'
import { connect } from 'dva'
import StatusBar from 'dew-statusbar'
import { Motion, spring } from 'react-motion'
import styles from './index.scss'

@connect(({ profit, config, overview }) => ({ profit, config, overview }))
export default
class Loading extends React.PureComponent {
  render() {
    const { profit, config, overview } = this.props
    if (profit.loading || config.loading || overview.loading) {
      return (
        <Motion
          defaultStyle={{opacity: 0}}
          style={{opacity: spring(1)}}
        >
          {
            ({opacity}) => (
              <div className={styles['loading-container']} style={{opacity}}>
                <StatusBar className={styles['loading']} type="loading"/>
              </div>
            )
          }
        </Motion>
      )
    } else {
      return null
    }
  }
}
