/* @flow */
import React, { Component } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import Pager from 'dew-pager'
import FilterBar from 'dew-filterbar'

import SizeProvider from '#/components/StaffPerf/SizeProvider'
import StackChart from '#/components/StaffPerf/StackChart'
import CoreCircle from '#/components/StaffPerf/CoreCircle'

import DataProvider from './DataProvider'

import styles from './styles.scss'

const PerfChart = SizeProvider(DataProvider(StackChart))

class Root extends Component {
  render () {
    const {
      loading, location,
      pageSize, total,
      filter,
      items, focus, range
    } = this.props
    const { page, from, to } = location.query

    const filterOpts = [
      {
        type: 'range',
        key: 'range',
        value: { from, to },
        allowClear: false
      }
    ]

    return <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.filterBar}>
          <FilterBar options={filterOpts} onChange={this.handleFilterChange} />
        </div>
        <div className={styles.content}>
          <div className={`${styles.chartWrapper} ${loading ? styles.noPointer : ''}`}>
            <PerfChart
              focus={focus}
              filter={filter}
              items={items}
              range={range}
              setFocus={this.handleSetFocus}
              backRoot={this.handleBackRoot} />
            <div className={styles.core}>
              <CoreCircle
                loading={loading}
                filter={filter}
                focus={focus}
                range={range}
                onClick={this.handleFilterClick} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.sidebar}>
        {
          total
            ? <Pager
              current={parseInt(page)}
              pageSize={pageSize}
              total={total}
              onChange={this.handleChange} />
            : null
        }
      </div>
    </div>
  }

  handleFilterChange = (payload) => {
    const { key, value } = payload
    if (key === 'range') {
      this.changeQuery({
        ...value
      })
    } else {
      this.changeQuery({
        [key]: value
      })
    }
  }

  changeQuery = (params: Object) => {
    const { dispatch, location } = this.props

    dispatch(routerRedux.push({
      pathname: '/StaffPerf',
      query: {
        ...location.query,
        ...params
      }
    }))
  }

  handleBackRoot = () => {
    this.handleSetFocus(this.props.root)
  }

  handleSetFocus = (node: cursorT) => {
    this.props.dispatch({
      type: 'focus/set',
      payload: node
    })
  }

  handleFilterClick = filter => e => {
    this.props.dispatch({
      type: 'filter/set',
      payload: filter
    })
  }

  handleChange = (nextPage: number) => {
    const { dispatch, location } = this.props

    this.changeQuery({
      page: nextPage
    })
  }
}

export default connect(state => ({
  focus: state.focus.data,
  filter: state.filter.data,
  ...state.list
}))(Root)
