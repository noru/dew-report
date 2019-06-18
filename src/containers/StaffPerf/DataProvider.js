/* @flow */
import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { formatData } from './helper'

@connect()
export default WrappedComponent => 
class extends PureComponent {
  render() {
    const { items, filter, range, ...restProps } = this.props

    if (!items || !items.length || !range) return null

    const data = formatData(items, range)

    const nodeList = data.map(n => ({
      id: n.id,
      text: n.name,
      stackes: n[filter],
      info: n.data
    }))

    return <WrappedComponent
      nodeList={nodeList}
      filter={filter}
      {...restProps} />
  }
}
