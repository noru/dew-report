/* @flow */
import React, { PureComponent } from 'react'
import { Button } from 'antd'

import { margin } from '#/constants'

import type { NodeT } from '#/types'

import TreeNodes from './TreeNodes'

import styles from './styles.scss'

type ChartProps = {
  width: number,
  height: number,
  diameter: number,
  view: Array<number>,
  focus: NodeT,
  focusCursor: Array<number>,
  setFocus: Function,
  handleBackUpper: Function,
  handleBackRoot: Function
}

const textTopPercent = 0.85 // Percentage of height to show text top in the asset circle

export default class Chart extends PureComponent<*, ChartProps, *> {
  render () {
    const {
      height, width, diameter,
      view, nodeList, focus,
      setFocus, handleBackUpper
    } = this.props

    if (!width || !height || !view.length) return null

    const [ x, y, r ] = view
    const size = r * 2 + margin

    const viewBox = [
      x - r - margin / 2,
      y - r - margin / 2,
      size,
      size
    ]

    const k = diameter / size

    return (
      <div className={styles.chart}>
        <div className={styles.btns}>
          <Button onClick={this.props.handleBackUpper}>返回上一层</Button>
          <Button className="m-l-1" onClick={this.props.handleBackRoot}>返回顶层</Button>
        </div>        
        <svg
          className={styles.svg}
          width={width}
          height={height}
          fontSize={20 / k}
          viewBox={viewBox.join(' ')}
          onClick={handleBackUpper}>
          <TreeNodes
            nodeList={nodeList}
            cursor={focus.cursor}
            setFocus={setFocus} />
          {/*<TextNodes 
            nodeList={nodeList}
            cursor={focus.cursor}
            setFocus={setFocus} />*/}
          {/*{ nodeList ? this.renderTexts(nodeList) : null }*/}
        </svg>
      </div>
    )
  }

  renderTexts = (nodeList: Array<NodeT>) => {
    // const { focus } = this.props
    return <g>
      {
        nodeList.map((node, index) => {
          return (
            <g
              key={`text-${index}`}
              transform={`translate(${node.x}, ${node.y})`}>
              <text dy="0.3em">{node.data.name.substring(0, 5)}</text>             
            </g>
          )
        })
      }
    </g>
  }
}
