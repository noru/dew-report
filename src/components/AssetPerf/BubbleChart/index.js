// @flow
import React from 'react'
import { connect } from 'dva'
import bowser from 'bowser'
import withClientRect from '#/HOC/withClientRect'
import Ring from '#/components/AssetPerf/Ring'
import Gauge from '#/components/AssetPerf/Gauge'
import { COLORS, BACKGROUND_COLORS, ROOT_COLOR, ROOT_BACKGROUND_COLOR, PAGE_SIZE } from '#/constants'

type Props = {
  clientRect: {
    width: number,
    height: number
  },
  data: *,
  depth: number,
  type: string
}

class BubbleChart extends React.PureComponent<*, Props, *> {

  valueToRadius(value, minRadius, maxRadius, range) {
    if (range[0] === range[1]) return maxRadius
    const res = (value - range[0]) / (range[1] - range[0]) * (maxRadius - minRadius) + minRadius
    if (res < 0) return minRadius
    return res
  }

  renderItem = (data, minRadius, maxRadius, range, cursor, enteringFlag) => {
    let color, background
    if (enteringFlag) {
      color = '#dddddd'
      background = `rgba(224, 224, 224, 0.3)`
    } else if (cursor.length === 0) {
      color = ROOT_COLOR
      background = ROOT_BACKGROUND_COLOR
    } else {
      color = COLORS[cursor[0] % PAGE_SIZE]
      background = BACKGROUND_COLORS[cursor[0] % PAGE_SIZE]
    }

    return (
      <Gauge
        r={this.valueToRadius(data.root.revenue, minRadius, maxRadius, range)}
        color={color}
        background={background}
        data={data}
      />
    )
  }

  render() {
    const { clientRect, data, depth, type } = this.props
    const { width, height } = clientRect
    return (
      <svg viewBox={`0 0 ${width} ${height}`}>
        {
          bowser.msie
          ?
          null
          :
          <defs>
            <filter id="drop-shadow" filterUnits="userSpaceOnUse" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blurOut"></feGaussianBlur>
              <feOffset dx="3" dy="3" result="offsetblur"></feOffset>
              <feOffset dx="-3" dy="-3" result="offsetblur"></feOffset>
              <feMerge>
                <feMergeNode in="BackgroundAlpha"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
          </defs>
        }
        <Ring
          cx={width / 2}
          cy={1.5 * height}
          px={width / 2}
          py={height * (1 - 0.2 / Math.sqrt(depth))}
          data={data}
          cursor={[]}
          renderItem={this.renderItem}
          range={[data.root.renevue, data.root.renevue]}
          dispatch={this.props.dispatch}
          getId={data => `${type}-${data.root.type}-${data.root.id}`}
        />
      </svg>
    )
  }
}

export default
connect()(withClientRect(BubbleChart))
