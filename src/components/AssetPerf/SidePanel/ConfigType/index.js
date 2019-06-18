/* @flow */
import React, { Component } from 'react'
import { Tooltip, Table } from 'antd'
import { connect } from 'dva'
import uuid from 'uuid/v4'

import { round } from '#/utils'

import type { ConfigT, NodeT, cursorT } from '#/types'

import EditBlock from 'dew-editblock'

import styles from './styles.scss'

const defaultTableProps = {
  size: 'small',
  bordered: true,
  pagination: false,
  scroll: { y: 174 },
  rowKey: n => n.id
}

@connect(state => ({
  groupBy: state.filters.groupBy,
  filterId: state.filters.data[1] ? state.filters.data[1][state.filters.groupBy] : null
}))
export default
class ConfigType extends Component<*, ConfigT, *> {
  onChange = node => key => v => this.props.dispatch({
    type: 'config/changes',
    payload: {
      ...node,
      [key]: v / 100,
    },
    filter: {
      [this.props.groupBy]: this.props.filterId
    }
  })

  render () {
    const { config } = this.props

    const tableProps = {
      ...defaultTableProps
    }

    return (
      <div>
        <Table dataSource={config} {...tableProps} onRowClick={this.props.onRowClick || (() => {})}>
          <Table.Column
            title={<div className="p-l-1">设备类型</div>}
            dataIndex="name"
            key="name"
            render={(text, node, index) => (
              <div className="p-l-1">
                {text}
              </div>
            )} />
          <Table.Column
            title="收入"
            dataIndex="revenue_increase"
            key="revenue_increase"
            width={70}
            render={(text, node, index) =>
              <EditBlock onChange={this.onChange(node)('revenue_increase')} formOpts={{
                initialValue: round(text * 100, 1),
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (value < -100) {
                        callback('输入不能小于-100')
                      } else {
                        callback()
                      }
                    }
                  }
                ]
              }} sign="%" />}
            />
          <Table.Column
            title="维护成本"
            dataIndex="cost_increase"
            key="cost_increase"
            width={70}
            render={(text, node, index) =>
              <EditBlock onChange={this.onChange(node)('cost_increase')} formOpts={{
                initialValue: round(text * 100, 1),
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (value < -100) {
                        callback('输入不能小于-100')
                      } else {
                        callback()
                      }
                    }
                  }
                ]
              }} sign="%" />
            } />
        </Table>
      </div>
    )
  }

  getParentCursors = (): Array<cursorT>  => {
    const { config, focus: { cursor }} = this.props

    const target = config.find(n => isFocusNode(n, cursor))

    if (!target) return []

    return getCursors(target)

    function getCursors(node) {
      const nodes = [getCursor(node)]
      getParent(node)
      return nodes.reverse().slice(1) // remove root

      function getParent(node) {
        const parent = node.parent
        if (!parent) return
        nodes.push(getCursor(parent))
        getParent(parent)
      }
    }
  }
}
