import React from 'react'
import { connect } from 'dva'
import Overview from './Overview'
import styles from './index.scss'

class System extends React.PureComponent {
  render() {
    const { cursor } = this.props.filters
    return (
      <div className={styles['system']}>
        {
          cursor.length === 2 ? <Overview /> : null
        }
      </div>
    )
  }
}

export default connect(({MaintenanceCost_filters, MaintenanceCost_overview}) => ({filters: MaintenanceCost_filters, overview: MaintenanceCost_overview}))(System)
