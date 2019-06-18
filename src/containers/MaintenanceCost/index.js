import React from 'react'
import { connect } from 'dva'
import Chart from '#/components/MaintenanceCost/Chart'
import styles from './index.scss'

class MaintenanceCost extends React.PureComponent {
  render() {
    return <Chart />
  }
}

export default
connect(({ profit, MaintenanceCost_filters }) => ({ profit, filters: MaintenanceCost_filters }))(MaintenanceCost)
