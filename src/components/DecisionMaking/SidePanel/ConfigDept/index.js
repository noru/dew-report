/* @flow */
import React, { Component } from 'react'
import { Tooltip, Table } from 'antd'

import { getCursor, isSameCursor, isFocusNode, round } from '#/utils'

import type { ConfigT, NodeT, cursorT } from '#/types'

import EditBlock from 'dew-editblock'

import styles from './styles.scss'

const defaultTableProps = {
  size: 'small',
  bordered: true,
  pagination: false,
  scroll: { y: 174 },
  rowKey: n => n.data.id
}

export default class ConfigDept extends Component<*, ConfigT, *> {
  render () {
    const { config, focus: { cursor}, depths, setFocus, loading } = this.props

    const configListOne = config.filter(n => n.depth === depths[0])
    .map(n => ({
      ...n,
      children: null
    }))

    if (!configListOne.length) return null

    const activeCursors = this.getParentCursors()

    const tableProps = {
      ...defaultTableProps,
      loading,
      onRowClick: node => setFocus(getCursor(node)),
      rowClassName: node => `${styles.tr} ${isFocusNode(node, activeCursors[0]) ? 'active': ''}`
    }

    return (
      <div>
        <Table dataSource={configListOne} {...tableProps}>
          <Table.Column
            title={<div className="p-l-1">科室名称</div>}
            dataIndex="data.name"
            key="name"
            render={(text, node, index) => (
              <div className="p-l-1">
                {text}
              </div>
            )} />
          <Table.Column
            title="预期增长"
            dataIndex="data.usage_predict_increase"
            key="increase"
            width={120}
            render={(text, node, index) => (
              <div>
                {round(text * 100, 1)}%
              </div>
            )} />
        </Table>
        { activeCursors[0] ? this.renderConfigTwo(activeCursors) : null}
      </div>
    )
  }

  renderConfigTwo = (activeCursors) => {
    const { config, focus: { cursor }, depths, setFocus, loading } = this.props

    const configListTwo = config.filter(n => n.depth === depths[1])
    .filter(n => isFocusNode(n.parent, activeCursors[0]))
    .map(n => ({
      ...n,
      children: null
    }))

    const tableProps = {
      ...defaultTableProps,
      loading,
      onRowClick: node => setFocus(getCursor(node)),
      rowClassName: node => `${styles.tr} ${isFocusNode(node, activeCursors[1]) ? 'active': ''}`
    }

    const thresholdNode = [
      <div>
        <Tooltip placement="topRight" title="您可以自定义使用率大于多少为满负荷">
          <i className="dewicon dewicon-circle-full"></i>
          <span>满负荷</span>
        </Tooltip>
      </div>,
      <div>
        <Tooltip placement="topRight" title="您可以自定义使用率小于多少为低负荷">
          <i className="dewicon dewicon-circle-low"></i>
          <span>低负荷</span>
        </Tooltip>
      </div>
    ]

    return (
      <div>
        <div className="text-center">
          <div className={styles.arrow}></div>
        </div>
        <Table dataSource={configListTwo} {...tableProps}>
          <Table.Column
            title={<div className="p-l-1">设备类型</div>}
            dataIndex="data.name"
            key="name"
            render={(text, node, index) => (
              <div className="p-l-1">
                {text}
              </div>
            )} />
          <Table.Column
            title="预期增长"
            dataIndex="data.usage_predict_increase"
            key="increase"
            width={70}
            render={(text, node, index) =>
              <EditBlock
                onChange={this.handleChange(getCursor(node), 'increase')}
                initialValue={round(text * 100, 1)}
                sign="%" />           
            } />
          <Table.Column
            title={thresholdNode[0]}
            dataIndex="data.usage_threshold[1]"
            key="max"
            width={70}
            render={(text, node, index) =>
              <EditBlock
                onChange={this.handleChange(getCursor(node), 'max')}
                initialValue={text * 100}
                sign="%" />
            } />
          <Table.Column
            title={thresholdNode[1]}
            dataIndex="data.usage_threshold[0]"
            key="min"
            width={70}
            render={(text, node, index) =>
              <EditBlock
                onChange={this.handleChange(getCursor(node), 'min')}
                initialValue={text * 100}
                sign="%" />
            } />
        </Table>
      </div>
    )
  }

  handleChange = (cursor: cursorT, fieldKey: string) => (value: string) => {
    this.props.dispatch({
      type: 'config/changes',
      payload: {
        cursor,
        [fieldKey]: value / 100
      }
    })
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
