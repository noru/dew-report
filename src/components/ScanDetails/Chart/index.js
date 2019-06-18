import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import { groupBy, flatMap } from 'lodash'
import Briefs from '#/components/ScanDetails/Briefs'
import Parts from '#/components/ScanDetails/Parts'
import Assets from '#/components/ScanDetails/Assets'
import Steps from '#/components/ScanDetails/Steps'
import Center from '#/components/ScanDetails/Center'

import styles from './index.scss'


export default
class Chart extends React.PureComponent {
  render() {
    return (
      <div className={styles['chart']}>
        <Briefs />
        <Parts />
        <Assets />
        {/* <Steps /> */}
        <Center />
      </div>
    )
  }
}
