/* @flow */
import React, { Component } from 'react'
import { Animate } from 'react-move'
import { connect } from 'dva'
import Tabs from 'dew-tabs'

import SystemPanel from './SystemPanel'
import ManualPanel from './ManualPanel'

import styles from './styles.scss'

const tabOpts = [
  {
    key: 'system',
    text: '系统自动'
  },
  {
    key: 'manual',
    text: '手动调节'
  }
]

@connect(state => ({
  focus: state.DecisionMaking_focus,
  loading: state.DecisionMaking_config.loading,
  config: state.DecisionMaking_config.data
}))
export default class SidePanel extends Component {
  state = {
    activeTab: 0,
    configed: false
  }

  render () {
    const { focus } = this.props
    const { activeTab, configed } = this.state

    return (
      <div className={styles.sidepanel}>
        <Tabs activeIndex={activeTab} options={tabOpts} onChange={this.handleTabChange} />
        <div className={styles.tabContent}>
          {
            activeTab === 0
              ? <Animate
                default={{translate: 100}}
                data={{translate: 0}}
                duration={300}
                easing='easeCubic'>
                {data => (
                  <div
                    style={{
                      transform: `translateX(${data.translate}%)`
                    }}
                  >
                  {
                    focus.node && focus.node.data
                      ? <SystemPanel data={focus.node.data} />
                      : null
                  }
                  </div>
                )}
              </Animate>
            : null
          }
          {
            activeTab === 1
              ? <Animate
                default={{translate: -100}}
                data={{translate: 0}}
                duration={300}
                easing='easeCubic'>
                {data => (
                  <div
                    style={{
                      transform: `translateX(${data.translate}%)`
                    }}
                  >
                    <ManualPanel
                      configed={configed}
                      markConfiged={this.markConfiged}
                      {...this.props} />
                  </div>
                )}
              </Animate>
            : null
          }
        </div>
      </div>
    )
  }

  handleTabChange = (index: number) => {
    this.props.dispatch({
      type: 'finance/data/toggle',
      payload: ['system', 'manual'][index]
    })

    this.setState({
      activeTab: index
    })
  }

  markConfiged = () => {
    this.setState({
      configed: true
    })
  }
}
