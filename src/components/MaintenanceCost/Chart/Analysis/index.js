import React from 'react'
import { connect } from 'dva'
import DewTabs from 'dew-tabs'
import { Button } from 'antd'
import System from './System'
import Manual from './Manual'
import One from '#/components/MaintenanceCost/Condition/One'
import Two from '#/components/MaintenanceCost/Condition/Two'
import Three from '#/components/MaintenanceCost/Condition/Three'
import Suggestions from './Suggestions'
import SingleAssetSuggestion from './SingleAssetSuggestion'
import styles from './index.scss'

class Analysis extends React.Component {
  state = {
    activeIndex: 0
  }

  onTabChange = index => this.setState({
    activeIndex: index
  })

  onConfirm = e => this.props.dispatch({
    type: 'confirm/clicked'
  })

  render() {
    const { filters, overview } = this.props
    const { cursor } = filters
    return (
      <div className={styles['analysis']}>
        <DewTabs
          activeIndex={this.state.activeIndex}
          options={[{key: 'system', text: '系统自动'}, {key: 'manual', text: '手工调节'}]}
          onChange={this.onTabChange}
        />
        <div className={styles['container']}>
          <div className="lead m-b-1 text-center">{cursor[1] ? overview.data.name : cursor[0] ? '汇总' : '全部选中设备'}</div>
          {
            this.state.activeIndex === 0
            ? <System />
            : <Manual />
          }
          <div className="m-b-1">
            <div className="lead m-b-1">建议购买MSA条件</div>
            <div>（满足任何一个条件都建议购买）</div>
            <One />
            <Two />
            <Three />
            {
              this.state.activeIndex === 0
              ? null
              : <Button className={styles['button']} onClick={this.onConfirm}>确认预期</Button>
            }
          </div>
          {
            cursor.length < 2
            ? <Suggestions />
            : <SingleAssetSuggestion />
          }
        </div>
      </div>
    )
  }
}

export default connect(({MaintenanceCost_overview, MaintenanceCost_filters}) => ({overview: MaintenanceCost_overview, filters: MaintenanceCost_filters}))(Analysis)
