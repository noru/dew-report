import React from 'react'
import StatusBar from 'dew-statusbar'
import { Motion, spring } from 'react-motion'
import { connect } from 'dva'
import styles from './index.scss'

class Loading extends React.PureComponent {
  render() {
    const {assets, groups, forecastOverview, overview, suggestions, thresholds} = this.props
    if (assets.loading || assets.rateLoading || groups.loading || forecastOverview.loading || overview.loading || suggestions.loading || thresholds.loading) {
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
    }
    return null
  }
}

export default connect(({MaintenanceCost_assets, groups, forecastOverview, MaintenanceCost_overview, suggestions, thresholds}) => ({
  assets: MaintenanceCost_assets,
  groups,
  forecastOverview,
  overview: MaintenanceCost_overview,
  suggestions,
  thresholds
}))(Loading)
