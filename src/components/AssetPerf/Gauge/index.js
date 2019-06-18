// @flow
import React from 'react'
import { scaleLinear } from 'd3-scale'
import { Motion, spring } from 'react-motion'
import withHover from '#/HOC/withHover'
import { ellipsis } from '#/utils/helpers'

const NAME_MAX_LENGTH = 6 // for text ellipsis

class Gauge extends React.PureComponent<*, *, *> {

  getWavePath = (radius: number, percent: number): string => {
    if (percent >= 1) {
      return 'M' + radius + ' 0'
        + 'm'+ (-radius) + ', 0'
        + 'a' + radius + ',' + radius + ' 0 1,0 ' + (radius * 2) + ',0'
        + 'a' + radius + ',' + radius + ' 0 1,0 ' + (radius * -2) + ',0'
    } else {
      var part = 1 - percent * 2
      var h = part * radius
      var w = Math.sqrt(Math.pow(radius, 2) - Math.pow(h, 2))

      var defaultWaveHeight = 0.1 // The wave height as a percentage of wave circle's radius

      var waveHeight = defaultWaveHeight
      if (percent + defaultWaveHeight > 1) {
        var waveScaleY = scaleLinear().range([0.035, 0.03]).domain([1 - defaultWaveHeight, 1])
        waveHeight = waveScaleY(percent)
      }
      if (percent < defaultWaveHeight) {
        var waveScaleY = scaleLinear().range([0.035, 0.03]).domain([defaultWaveHeight, 0])
        waveHeight = waveScaleY(percent)
      }

      if (percent > 0.99 || percent < 0.01) {
        return 'M' + (radius - w) + ' ' + h
        + 'A' + radius + ',' + radius + ' 1' + (percent > 0.5 ? ' 1,0 ' : ' 0,0 ') + (radius + w) + ',' + h
        + 'z'
      } else {
        return 'M' + (radius - w) + ' ' + h
        + 'A' + radius + ',' + radius + ' 1' + (percent > 0.5 ? ' 1,0 ' : ' 0,0 ') + (radius + w) + ',' + h
        + 'q' + -w / 2 + ' ' + radius * waveHeight + ' ' + -w + ' 0'
        + 't' + -w + ' ' +  0
        + 'z'
      }
    }
  }

  render() {
    const { color, r, background, data, hovered, dispatch } = this.props
    const { root } = data
    const percent = root.revenue === 0 ? 1 : root.cost / root.revenue

    return (
      <Motion
        defaultStyle={{
          percent: 0,
          opacity: 0
        }}
        style={{
          percent: spring(percent),
          opacity: spring(hovered ? 1 : 0)
        }}
      >
        {
          ({ percent, opacity }) => (
            <g cursor="pointer">
              <circle
                opacity={opacity}
                r={r}
                filter="url(#drop-shadow)"
                strokeWidth="1"
                stroke={background}
                fill="none"
              />
              <circle
                r={r}
                strokeWidth="1"
                stroke={color}
                fill={background}
              />
              <path
                transform={`translate(${-r * 0.9}, 0)`} // todo: remove transform here
                fill={color}
                d={this.getWavePath(r * 0.9, percent)}
              />
              <g opacity={1 - opacity}>
                <Text y={-r / 3} children={root.name === 'total' ? '' : ellipsis(root.name, NAME_MAX_LENGTH)} />
                <Text y={0} children={root.revenue_label + root.revenue_label_unit} />
                <Text y={r / 3} children={root.cost_label + root.cost_label_unit} />
              </g>
              <g opacity={opacity}>
                { getNodeName(root.name, NAME_MAX_LENGTH, r) }
                <Text y={-r / 2} children={root.revenue_text || '收入'} />
                <Text y={-r / 6} children={root.revenue_label + root.revenue_label_unit} />
                <Text y={r / 6} children={root.cost_text || '成本'} />
                <Text y={r / 2} children={root.cost_label + root.cost_label_unit} />
              </g>
            </g>
          )
        }
      </Motion>
    )
  }
}

function Text({ y, children }) {
  return <text
    fill="#595959"
    textAnchor="middle"
    dy="0.35em"
    y={y}
  >
    {children}
  </text>
}

function getNodeName(name, limit, offset) {
  if (name.length <= limit) {
    return <Text y={-offset - 20} children={name} />
  } else {
    let splitAt = name.length / 2
    return <Text y={-offset - 40}>
        <tspan textAnchor="middle" x="0" dy="1em">{name.substring(0, splitAt)}</tspan>
        <tspan textAnchor="middle" x="0" dy="1em">{name.substring(splitAt)}</tspan>
      </Text>
  }
}

export default withHover(Gauge)
