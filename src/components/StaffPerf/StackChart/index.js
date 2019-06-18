/* @flow */
import React, { PureComponent } from 'react'
import { Transition } from 'react-move'
import { scaleLinear } from 'd3-scale'

import { margin, stackHeight, pageSize } from '#/constants'
import { getRadian } from '#/utils'

import ArcStack from '../ArcStack'

const averageSpace = 360 / pageSize

const barAngle = averageSpace * 0.75

const mockData = Array(15).fill([0.4, 0.3, 0.2, 0.1])

function scaleFn (length: number) {
  if (length === 1) {
    return () => 0
  } else if (length < 8) {
    const space = length / 2 * averageSpace
    return scaleLinear().range([-space, space]).domain([0, length - 1])
  } else {
    return scaleLinear().range([-90, 270]).domain([0, length])
  }
}

type PropsT = {
  width: number,
  height: number,
  diameter: number,
  nodeList: Array<Object>
}

export default class Chart extends PureComponent<*, PropsT, *> {
  render () {
    const {
      height, width, diameter,
      nodeList, focus, setFocus, backRoot,
      ...restProps
    } = this.props

    if (!diameter) return null

    const radius = (diameter - margin) / 2

    const getAngle = scaleFn(nodeList.length)

    const chartData = nodeList.map((node, i) => {
      const middleAngle = getAngle(i)
      const startAngle= getRadian(middleAngle - barAngle / 2)
      return {
        ...node,
        startAngle
      }
    })

    return (
      <div>
        <svg width={width} height={Math.max(height, 650)} onClick={this.props.backRoot}>
          <g transform={`translate(${width / 2}, ${height / 2})`}>
            <Transition
              data={chartData}
              getKey={(node, index) => node.id || index}
              update={node => ({
                startAngle: node.startAngle,
                opacity: (focus && focus.id) ? (node.id === focus.id ? 1 : 0.3) : 1
              })}
              enter={node => ({
                startAngle: getRadian(-90),
                opacity: 0
              })}
              leave={node => ({
                startAngle: getRadian(90),
                opacity: 0
              })}
              duration={300}
              flexDuration={true}
              easing="easePolyIn">
              {data => (
                <g>
                  {
                    data.map(node =>
                      <ArcStack
                        key={node.key}
                        style={{opacity: node.state.opacity}}
                        onClick={this.handleClick(node.data)}
                        innerRadius={radius - stackHeight}
                        startAngle={node.state.startAngle}
                        endAngle={node.state.startAngle + getRadian(barAngle)}
                        text={node.data.text}
                        stackes={node.data.stackes.map(c => c * stackHeight)}
                        {...restProps} />
                    )
                  }
                </g>
              )}
            </Transition>
          </g>
        </svg>
      </div>
    )
  }

  handleClick = node => e => {
    e.stopPropagation()
    const { focus } = this.props
    if (focus && node.id === focus.id) {
      this.props.backRoot()
    } else {
      this.props.setFocus(node.info)
    }
  }
}
