import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { spring, Motion } from 'react-motion'
import { Polar2Cartesian } from '#/utils/math'
import { AnnulusSector } from '#/utils/draw'

import './styles.scss'

const MIN_BALL_INTERVAL = 18

function renderBall(ball, radius, cx, cy, angle, ballRadius) {
  let [x, y] = Polar2Cartesian(radius, angle, { baseX: cx, baseY: cy })

  return (
    <g className="orbit-chart-ball" key={ball.key} >
      <circle cx={x} cy={y} r={ballRadius} fill="white" stroke="gray"/>
      <text x={x} y={y} textAnchor="middle" dy=".3em">{ball.label}</text>
    </g>
  )
}

function renderLane(balls, radius, cx, cy, color) {
  let ball = balls.find(_ => _.connectPrevious)
  if (ball) {
    return (
      <Motion defaultStyle={{startAngle: 90}} style={{startAngle: spring(90 - (ball.distance || 0))}}>
        { interpolated =>
          (<g className="orbit-chart-lane">
            <path d={AnnulusSector({
              startAngle: interpolated.startAngle,
              endAngle: 90,
              outerRadius: radius + 5,
              innerRadius: radius - 5,
              cx: cx,
              cy: cy,
            })} fill={color} stroke="none" />
          </g>)
        }
      </Motion>
    )
  } else {
    return null
  }
}

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 ||
             window.navigator.userAgent.indexOf('Trident/') > -1

function trail(cx, cy, r) {
  return (<path
    className="orbit-trail" fill="none" stroke="gray"
    style={isIE ? {strokeDashoffset:0} : null}
    d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.866 * r} ${cy - r/2}`}
  />)
}

// In case neighbors got overlap, comb them up with a min interval
function combBalls(balls) {
  if (balls.filter(b => b.distance > 0).length === 0) {
    return
  }
  balls.forEach((ball, i) => {
    // skip first and last
    if (i ===0 || i === balls.length - 1) {
      return
    }
    let prevBall = balls[i - 1]
    let interval = ball.distance - prevBall.distance
    let overlap = MIN_BALL_INTERVAL - interval
    if (overlap > 0 && ball.distance + overlap < 300) {
      ball.distance += overlap
    }
  })
  // do it again backwards
  for(let i in balls) {
    // skip first and last
    if (i == 0 || i == balls.length - 1) {
      continue
    }
    let _i = balls.length - 1 - i
    let ball = balls[_i]
    let nextBall = balls[_i + 1]
    let interval = nextBall.distance - ball.distance
    let overlap = MIN_BALL_INTERVAL - interval
    if (overlap > 0) {
      ball.distance -= overlap
    }
  }
}

export default class OrbitChart extends PureComponent {

  render() {

    let { id, className, radius, ballRadius, balls, laneColor } = this.props
    let totalRadius = radius + ballRadius
    let chartSize = (radius + ballRadius) * 2
    let cx, cy; cx = cy = totalRadius

    combBalls(balls)

    return (
      <div id={id} className={classnames('orbit-chart', className)}>
        <svg width={chartSize} height={chartSize}>
          { trail(cx, cy, totalRadius) }
          { renderLane(balls, totalRadius, cx, cy, laneColor) }
          { balls.map(ball => {
            let angle = (ball.distance || 0) - 90
            return (
              <Motion key={ball.key} defaultStyle={{angle: 90}} style={{angle: spring(angle)}}>
                { interpolated =>
                  renderBall(ball, totalRadius, cx, cy, interpolated.angle, ballRadius)
                }
              </Motion>
            )

          })}
        </svg>
      </div>
    )
  }
}

OrbitChart.defaultProps = {
  startAngle: 0,
  endAngle: 360,
  clockwise: true,
  maxBallAngle: 360,
}

OrbitChart.propTypes = {
  radius: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
  endAngle: PropTypes.number,
  clockwise: PropTypes.bool,
  ballRadius: PropTypes.number.isRequired,
  maxBallAngle: PropTypes.number,
  balls: PropTypes.arrayOf(PropTypes.object),
  laneColor: PropTypes.string.isRequired
}