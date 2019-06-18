/* @flow */
import React, { Component } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Dropdown, Button, Icon, Menu } from 'antd'
import FilterBar from 'dew-filterbar'
import Pager from 'dew-pager'
import RingSectorLayout from 'ring-sector-layout'
import AnnulusSector from 'ring-sector-layout/dist/AnnulusSector'
import AnnulusSectorStack from 'ring-sector-layout/dist/AnnulusSectorStack'

import { QUALITY, COMPLETION, defaultPage } from '#/constants'
import CoreCircle from '#/components/MaintenanceStats/CoreCircle'

import PartGroup from './PartGroup'
import PartAsset from './PartAsset'

import styles from './styles.scss'

const purple = '#b781b4'
const prasinous = '#6ab6a6'

const roleFilterFn = (isHead, cb) => n => {
  if (!isHead) return cb(n)
  else return true
}

@connect(state => ({
  user: state.user.info,
  root: state.root.data,
  group: state.group,
  asset: state.asset,
  filter: state.MaintenanceStats_filter,
  loading: state.group.loading || state.asset.loading
}))
export default class Root extends Component {
  state = {
    groupAD: 0,
    assetAD: 0,
    selected: []
  }

  componentDidMount () {
    const { location, dispatch } = this.props

    dispatch({
      type: 'MaintenanceStats_filter/data/get'
    })
    // remove selected asset and group when initial load
    dispatch(routerRedux.push({
      pathname: '/MaintenanceStats',
      query: {
        ...location.query,
        assetId: undefined,
        groupId: undefined
      }
    }))
  }

  render () {
    const { group, asset, location, filter, loading, user, root } = this.props
    const { groupPage, assetPage, dept, type, groupby } = location.query

    const { groupAD, assetAD, selected } = this.state
    const filterOpts = [
      {
        type: 'range',
        key: 'range'
      },
      {
        type: 'select',
        key: 'dept',
        value: dept,
        options: filter.depts,
        placeholder: '全部科室'
      },
      {
        type: 'select',
        key: 'type',
        value: type,
        options: filter.types,
        placeholder: '全部设备类型'
      }
    ].filter(roleFilterFn(user.isHead, n => n.key !== 'dept'))

    const groupbyOpts = [
      {
        type: 'select',
        key: 'dept',
        value: groupby,
        options: [
          {
            id: 'type',
            name: '显示设备类型'
          },
          {
            id: 'supplier',
            name: '显示品牌'
          },
          {
            id: 'dept',
            name: '显示科室'
          }
        ].filter(roleFilterFn(user.isHead, n => n.id !== 'dept')),
        allowClear: false
      }
    ]

    const { text: selectedGroupby } = groupbyOpts.find(n => n.key === groupby) || groupbyOpts[0]

    const existSelected = selected.filter(n => n)

    const focus = existSelected[existSelected.length - 1] || root

    return (
      <div className={styles.container}>
        <div className={styles.filters}>
          <FilterBar options={filterOpts} onChange={this.handleFilterChange} />
        </div>
        <div className={styles.chartWrapper}>
          <div className={styles.core}>
            <CoreCircle
              loading={loading}
              switcher={filter.switcher}
              focus={focus}
              onClick={this.handleSwitcherChange} />
          </div>
          <div className={styles.leftPager}>
            <Pager
              current={parseInt(groupPage)}
              pageSize={group.pageSize}
              total={group.total}
              onChange={this.handleLeftPageChange} />
          </div>
          <div className={styles.rightPager}>
            <Pager
              current={parseInt(assetPage)}
              pageSize={asset.pageSize}
              total={asset.total}
              onChange={this.handleRightPageChange} />
          </div>
          <div className={styles.group}>
            <div className={styles.groupby}>
              <FilterBar options={groupbyOpts} onChange={this.handleGroupbyChange} />
            </div>
            {
              group.items.length
                ? <PartGroup
                    data={group.items}
                    selectedGroupId={location.query.groupId}
                    animationDirection={groupAD}
                    onClick={this.handleGroupClick}
                    switcher={filter.switcher} />
                : null
            }
          </div>
          <div className={styles.asset}>
            {
              asset.items.length
                ? <PartAsset
                    data={asset.items}
                    selectedAssetId={location.query.assetId}
                    animationDirection={assetAD}
                    onClick={this.handleAssetClick}
                    switcher={filter.switcher} />
                : null
            }
          </div>
        </div>
      </div>
    )
  }

  handleSwitcherChange = key => e => {
    e.preventDefault()
    this.props.dispatch({
      type: 'MaintenanceStats_filter/switcher/set',
      payload: key
    })
  }

  handleGroupbyChange = ({ value }) => {
    this.changeQuery({
      groupby: value,
      groupId: undefined,
      groupPage: defaultPage
    })
  }

  handleGroupbyChange1 = (e) => {
    const { location } = this.props

    this.changeQuery({
      groupby: e.key,
      groupId: undefined,
      groupPage: defaultPage
    })
  }

  handleGroupClick = (id: string, data: Object) => e => {
    e.preventDefault()
    const { dispatch, location, root } = this.props
    const { query: { groupId }  } = location

    // remove groupId when click the selected group
    const isGroupSelected = id == groupId

    const newGroupId = isGroupSelected ? undefined : id

    this.changeQuery({
      groupId: newGroupId,
      assetId: undefined,
      assetPage: defaultPage // set asset page to `defaultPage` when groupId set
    })

    this.setState({
      selected: [isGroupSelected ? null : data, null]
    })
  }

  handleAssetClick = (id: string, data: Object) => e => {
    e.preventDefault()
    const { dispatch, location, root } = this.props
    const { query: { assetId }  } = location
    const { lastSelectedGroup } = this.state

    // remove groupId when click the selected group
    const isAssetSelected = id == assetId

    const newAssetId = isAssetSelected ? undefined : id
    this.changeQuery({ assetId: newAssetId })

    this.setState({
      selected: [this.state.selected[0], isAssetSelected ? null : data]
    })
  }

  handleLeftPageChange = (current: number, last: number) => {
    this.changeQuery({
      groupPage: current,
      groupId: undefined,
      assetId: undefined
    })

    this.setState((state, props) => ({
      ...state,
      groupAD: last - current,
      lastSelectedGroup: this.props.root
    }))
  }

  handleRightPageChange = (current: number, last: number) => {
    this.changeQuery({
      assetPage: current,
      assetId: undefined
    })

    this.setState((state, props) => ({
      ...state,
      assetAD: last - current
    }))
  }

  handlePageChange = (key: string) => (current: number, last: number) => {
    // remove selected group id in query when pager changed
    this.changeQuery({
      [`${key}Page`]: current,
      groupId: undefined
    })

    this.setState((state, props) => ({
      ...state,
      [`${key}AD`]: last - current
    }))
  }

  handleFilterChange = (payload) => {
    const { key, value } = payload
    if (key === 'range') {
      this.changeQuery({
        ...value,
        assetPage: defaultPage
      })
    } else {
      this.changeQuery({
        [key]: value,
        assetPage: defaultPage,
        groupPage: defaultPage
      })
    }
  }

  changeQuery = (params: Object) => {
    const { dispatch, location } = this.props

    dispatch(routerRedux.push({
      pathname: '/MaintenanceStats',
      query: {
        ...location.query,
        ...params
      }
    }))
  }
}
