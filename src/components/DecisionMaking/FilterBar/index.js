/* @flow */
import React, { Component } from 'react'
import { Menu, Dropdown, Button, Icon } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'

import { currentYear } from '#/constants'

import styles from './styles.scss'

@connect(state => ({
  user: state.user.info
}))
export default class FilterBar extends Component {
  render () {
    const menu = <Menu onClick={this.handleMenuClick}>
      {
        [currentYear, currentYear + 1].map(year => {
          return <Menu.Item key={year}>
            <span>{year}年预测</span>
          </Menu.Item>
        })
      }
    </Menu>

    const { user: { isHead }, location: { query }} = this.props

    return (
      <div className="flex flex--justify-content--space-between p-a-1">
        <div className={styles.year}>
          <Dropdown overlay={menu} trigger={['click']} placement='bottomCenter'>
            <Button>
              { query.year || currentYear }年预测 <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <div className={styles.groupby}>
          {isHead ? this.renderGroupBy(query) : null}
        </div>
      </div>
    )
  }

  renderGroupBy = (query: Object) => {
    const groupbyOpts = [
      {
        key: 'dept',
        text: '按科室',
        onClick: this.handleGroupbyClick('dept')
      },
      {
        key: 'type',
        text: '按设备类型',
        onClick: this.handleGroupbyClick('type')
      }
    ]

    return <div>
      {
        groupbyOpts.map(({key, text, onClick}) => {
          return (
            <Button
              key={key}
              className="m-l-1"
              type={query.groupby === key ? 'primary' : ''}
              onClick={onClick}>
              {text}
            </Button>
          )
        })
      }
    </div>
  }

  handleGroupbyClick = groupby => (e: Event) => {
    e.preventDefault()
    this.handlePush({ groupby })
  }

  handleMenuClick = (e: Event) => {
    this.handlePush({ year: e.key })
  }

  handlePush = (newQuery) => {
    const { location, dispatch } = this.props

    dispatch(routerRedux.push({
      pathname: '/DecisionMaking',
      query: {
        ...location.query,
        ...newQuery
      }
    }))
  }
}
