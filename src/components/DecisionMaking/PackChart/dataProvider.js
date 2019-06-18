/* @flow */
import React, { Component } from 'react'
import { connect } from 'dva'
import { transition } from 'd3-transition'
import { interpolateZoom } from 'd3-interpolate'
import raf from 'raf'

import type { cursorT } from '#/types'

import { getCursor, isSameCursor } from '#/utils'
import { margin } from '#/constants'

const sizeKey = 'size'
const childKey = 'items'

type State = {
  focusId: string,
  nodeList: Array<Object>,
  visibleNodes: Array<Object>
}

export default WrappedComponent =>
@connect(state => ({
  nodeList: state.nodeList.data,
  focus: state.DecisionMaking_focus,
}))
class extends Component {
  state = {
    view: []
  }

  componentDidMount () {
    const { diameter, focus, nodeList, dispatch } = this.props

    if (diameter) {
      dispatch({
        type: 'nodeList/coefficient/set',
        payload: {
          diameter,
          margin
        }
      })
    }

    const { cursor } = focus
    if (cursor.length) {
      const [ id, depth ] = focus.cursor
      const target = nodeList.find(n => n.data.id === id && n.depth === depth)

      if (target) {
        const view = this.getView(target)
        this.setState({ view })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { diameter, focus, nodeList, dispatch } = nextProps
    if (diameter && diameter !== this.props.diameter) {
      dispatch({
        type: 'nodeList/coefficient/set',
        payload: {
          diameter,
          margin
        }
      })
    }

    const { cursor } = focus
    if (cursor.length) {
      const [ id, depth ] = focus.cursor
      const target = nodeList.find(n => n.data.id === id && n.depth === depth)
      if (target) {
        if (!this.state.view.length) {
          const view = this.getView(target)
          this.setState({ view })
        } else {
          this.setView(target)
        }
      }
    }
  }

  render() {
    const { nodeList, focus, width, height, diameter } = this.props
    const { view } = this.state

    if (!nodeList) return <div>data loading...</div>
    return <WrappedComponent
      view={view}
      width={width}
      height={height}
      diameter={diameter}
      focus={focus}
      nodeList={nodeList}
      setFocus={this.setFocus}
      handleBackUpper={this.handleBackUpper}
      handleBackRoot={this.handleBackRoot} />
  }

  handleBackUpper = (e?: Event) => {
    e && e.preventDefault()
    const { focus: { cursor }, nodeList } = this.props

    if (cursor.length) {
      const [ id, depth ] = cursor
      const target = nodeList.find(n => n.data.id === id && n.depth === depth)
      if (target.parent) this.setFocus(getCursor(target.parent))
    }
  }

  handleBackRoot = (e?: Event) => {
    e && e.preventDefault()
    const { nodeList } = this.props
    if (nodeList[0]) this.setFocus(getCursor(nodeList[0]))
  }

  setFocus = (cursor: cursorT) => {
    if (cursor === this.props.focus.cursor) return

    this.props.dispatch({
      type: 'focus/cursor/set',
      payload: cursor
    })
  }

  setView = (focus: Object) => {
    const nextView = this.getView(focus)
    const i = interpolateZoom(this.state.view, nextView)

    transition()
    .duration(750)
    .tween('zoom', () => t => {
      this.setState({
        view: i(t)
      })
    })
  }

  setView1 = (focus: Object) => {
    const nextView = this.getView(focus)
    const i = d3.interpolateZoom(this.state.view, nextView)

    const start = Date.now()
    const loop = (now = Date.now())  => {
      raf(() => {
        const now = Date.now()
        const t = (now - start) / 1000 / 0.75
        if (t > 1) return
        this.setState((state, props) => {
          return {
            ...state,
            view: i(t)
          }
        })

        loop(now)
      })
    }

    raf(loop)
  }

  getView = (node: Object) => {
    return [node.x, node.y, node.r]
  }
}
