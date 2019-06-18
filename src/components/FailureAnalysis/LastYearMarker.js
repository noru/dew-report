import React, { PureComponent } from 'react'
import { Polar2Cartesian } from 'react-gear-chart/dist/utils/math'

export default class LastYearMarker extends PureComponent {

  toothAngle() {
    return this.props.endAngle - this.props.startAngle
  }

  render() {
    let { startAngle, endAngle, r, cx, cy, offsetAngle, style } = this.props
    let centerlineAngle = startAngle + offsetAngle + this.toothAngle() / 2
    let color = '#bababa'
    let [x, y] = Polar2Cartesian(r, (endAngle + startAngle) / 2, { baseX: cx, baseY: cy })
    return (<g className="last-year-marker" style={style}>
      <Line
        startAngle={startAngle}
        endAngle={endAngle}
        r={r}
        cx={cx}
        cy={cy}
        color={color}
      />
      <Dot
        angle={centerlineAngle}
        cx={x}
        cy={-y}
        color={color}
      />
    </g>)
  }
}

export class Line extends PureComponent {

  render() {
    let { startAngle, endAngle, r, cx, cy, color } = this.props
    let [x1, y1] = Polar2Cartesian(r, startAngle, { baseX: cx, baseY: cy })
    let [x2, y2] = Polar2Cartesian(r, endAngle, { baseX: cx, baseY: cy })
    return (
      <path
        className="orbit-trail" fill="none" stroke={color}
        d={`M ${x1} ${-y1} A ${r} ${r} 0 0 0 ${x2} ${-y2}`}
      />
    )
  }
}

export class Dot extends PureComponent {

  render() {
    let { color, cx, cy } = this.props
    // todo calculate cx,cy
    return (
      <circle className="last-year-dot"
        cx={cx}
        cy={cy}
        r="2.5"
        stroke="none"
        fill={color}
      />
    )
  }
}