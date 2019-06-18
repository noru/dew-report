/* @flow */
import React, { Component } from 'react'
import { Tooltip, Table } from 'antd'
import { connect } from 'dva'

import { getCursor, isSameCursor, isFocusNode, round } from '#/utils'

import type { ConfigT, NodeT, cursorT } from '#/types'

import styles from './styles.scss'

const defaultTableProps = {
  size: 'small',
  bordered: true,
  pagination: false,
  scroll: { y: 174 },
  rowKey: n => n.id
}

export default
@connect(state => ({
  filterId: state.filters.data[1] ? state.filters.data[1][state.filters.groupBy] : null
}))
class ConfigGroup extends Component<*, ConfigT, *> {
  render () {
    const { config, filterId } = this.props

    const tableProps = {
      ...defaultTableProps,
      // loading,
      onRowClick: this.props.onRowClick,
      rowClassName: node => `${styles.tr} ${node.id === filterId ? 'active' : ''}`
    }

    return (
      <div className="m-b-1">
        <Table dataSource={config} {...tableProps}>
          <Table.Column
            title={<div className="p-l-1">{{dept: '科室', type: '设备', month: '月份'}[config[0].type]}</div>}
            dataIndex="name"
            key="name"
            render={(text, node, index) => (
              <div className="p-l-1">
                {text}
              </div>
            )}
          />
          <Table.Column
            title="收入"
            dataIndex="revenue_increase"
            key="revenue"
            width={70}
            render={(text, node, index) => (
              <div>
                {round(text * 100, 1)}%
              </div>
            )} />
          <Table.Column
            title="维护成本"
            dataIndex="cost_increase"
            key="cost"
            width={70}
            render={(text, node, index) => (
              <div>
                {round(text * 100, 1)}%
              </div>
            )} />
        </Table>
      </div>
    )
  }
}
