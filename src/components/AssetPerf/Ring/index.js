// @flow
import React from 'react'
import { connect } from 'dva'
import { TransitionMotion, spring } from 'react-motion'
import { times, clamp } from 'lodash'
import { PAGE_SIZE, COLORS } from '#/constants'

class Button extends React.PureComponent<*, *, *> {
  render() {
    const RADIUS = 20
    const innerRadius = RADIUS * 0.8
    const { next, prev, x, y, onClick } = this.props
    const sign = next ? 1 : -1
    return (
      <g transform={`translate(${x}, ${y})`} onClick={onClick || (() => {})}>
        <circle
          fill="transparent"
          stroke="#a0a0a0"
          r={RADIUS}
        />
        <path
          stroke="none"
          fill="#a0a0a0"
          d={`M ${-innerRadius / 2 * Math.sqrt(3)}, ${-innerRadius / 2 * sign} l ${innerRadius * Math.sqrt(3)}, ${0} L ${0}, ${innerRadius * sign} Z`}
        />
      </g>
    )
  }
}

type Data = any

type Tree = {
  startAngle: number,
  endAngle: number,
  getChildren: Data => Array<any>,
  getChildrenRange: Data[] => [number, number]|null,
  getId: Data => string,
  getPageInfo: Data => Object,
  cx: number,
  cy: number,
  px: number,
  py: number,
  data: Data,
  cursor: Array<string|number>,
  renderItem: Data => React$Element<any>,
  curPage: number | void,
  maxRadius: number,
  minRadius: number,
  range: [number, number],
  dispatch: any,
  enteringFlag: number
}

type DefaultProps = {
  startAngle: number,
  endAngle: number,
  getChildren: Data => Array<any>,
  getChildrenRange: Data[] => [number, number]|null,
  getId: Data => string,
  getPageInfo: Data => Object,
  maxRadius: number,
  minRadius: number
}

type Point = [number, number]


class Ring extends React.PureComponent<DefaultProps, Tree, *> {
  static defaultProps = {
    startAngle: -45 / 180 * Math.PI,
    endAngle: 45 / 180 * Math.PI,
    getChildren: data => data.items,
    getChildrenRange: children => {
      if (children === undefined) return null
      return children.reduce((prev, cur) => {
        if (cur.root.revenue < prev[0]) prev[0] = cur.root.revenue
        if (cur.root.revenue > prev[1]) prev[1] = cur.root.revenue
        return prev
      }, [+Infinity, -Infinity])
    },
    getId: data => data.root.id,
    getPageInfo: data => data.pages,
    maxRadius: 60,
    minRadius: 45
  }

  distribute(startAngle: number, endAngle: number, count: number): number[] {
    const q = 0.7 / Math.sqrt(this.props.cursor.length + 1)
    endAngle = q * endAngle
    startAngle = q * startAngle
    const totalRange = endAngle - startAngle
    const span = totalRange / count
    return times(count, index => span / 2 + index * span + startAngle)
  }

  calcIncludedAngle(pc: Point, pa: Point, pb: Point): number {
    const CA = Math.sqrt((pc[0] - pa[0]) ** 2 + (pc[1] - pa[1]) ** 2)
    const CB = Math.sqrt((pc[0] - pb[0]) ** 2 + (pc[1] - pb[1]) ** 2)
    const AB = Math.sqrt((pa[0] - pb[0]) ** 2 + (pa[1] - pb[1]) ** 2)
    return Math.acos(clamp((CA*CA+CB*CB-AB*AB)/(2*CA*CB), -1, 1))
  }

  calcCurvePath(startPoint: Point, endPoint: Point): string {
    const T0 = 12
    const T1 = 18
    const [startX, startY] = startPoint
    const [endX, endY] = endPoint
    const x = Math.abs(endX - startX)
    const y = Math.abs(endY - startY)
    const theta = Math.atan(y / x)
    const d = Math.sqrt(x * x + y * y)
    const controlD = d * Math.sin(T0 / 180 * Math.PI) / Math.sin((180 - T0 - T1) / 180 * Math.PI)
    const controlX = startX + (endX > startX ? 1 : -1) * controlD * Math.cos(T1 / 180 * Math.PI + theta)
    const controlY = startY - controlD * Math.sin(T1 / 180 * Math.PI + theta)
    return `M ${startX}, ${startY} Q ${controlX}, ${controlY} ${endX}, ${endY}`
  }

  calcPrevR() {
    const { px, py, cx, cy } = this.props
    return Math.sqrt((py - cy) ** 2 + (px - cx) ** 2)
  }

  renderPagination() {
    const pages = this.props.getPageInfo(this.props.data)
    if (!pages) return null
    const prevR = this.calcPrevR()
    const { px, py, cx, cy, cursor, startAngle, endAngle, data, dispatch } = this.props
    const r = prevR * (1 + 0.5 / Math.sqrt(cursor.length + 1))
    const positions = this.distribute(startAngle, endAngle, data.items.length)

    return (
      <g>
        {
          !pages.start
          ? null
          :
          <Button
            onClick={e => dispatch({
              type: 'profit/data/get',
              level: cursor.length,
              start: Math.max(data.pages.start - PAGE_SIZE, 0)
            })}
            next
            x={cx + r * Math.sin(positions[0] - 5 / 180 * Math.PI)}
            y={cy - r * Math.cos(positions[0] - 5 / 180 * Math.PI)}
          />
        }
        {
          pages.start + pages.limit >= pages.total
          ? null
          :
          <Button
            onClick={e => dispatch({
              type: 'profit/data/get',
              level: cursor.length,
              start: Math.min(data.pages.start + PAGE_SIZE, data.pages.total)
            })}
            next
            x={cx + r * Math.sin(positions[positions.length - 1] + 5 / 180 * Math.PI)}
            y={cy - r * Math.cos(positions[positions.length - 1] + 5 / 180 * Math.PI)}
          />
        }
      </g>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.pages || !this.props.data.pages) return this.direction = 0
    else if (nextProps.data.pages.start === this.props.data.pages.start) return this.direction = 0
    else if (nextProps.data.pages.start > this.props.data.pages.start) return this.direction = -1
    else return this.direction = 1

  }

  onClick = e => {
    const { data, cursor, dispatch } = this.props
    if (cursor.length === 0) {
      dispatch({
        type: 'filters/data/change',
        payload: null,
        level: 0
      })
    } else if (cursor.length === 1) {
      dispatch({
        type: 'filters/data/change',
        payload: {
          [data.root.type]: data.root.id
        },
        level: 1
      })
    }
  }

  render() {
    const {
      startAngle,
      endAngle,
      getChildren,
      getChildrenRange,
      getId,
      getPageInfo,
      cx,
      cy,
      px,
      py,
      data,
      cursor,
      renderItem,
      minRadius,
      maxRadius,
      range,
      enteringFlag
    } = this.props
    const item = renderItem(data, minRadius, maxRadius, range, cursor, enteringFlag)

    const childrenRange = getChildrenRange(getChildren(data))

    return (
      <g>
        <g
          onClick={this.onClick}
          transform={`translate(${px}, ${py})`}
        >
          {item}
        </g>
        {this.renderPagination()}
        {
          getChildren(data) && px !== 0
          ?
          <TransitionMotion
            defaultStyles={getChildren(data).map((child, index) => ({
              key: `${getId(child) || index}`,
              data: child,
              style: {
                x: px,
                y: py,
                rotate: 0,
                opacity: 1
              }
            }))}
            styles={getChildren(data).map((child, index) => {
              const position = this.distribute(startAngle, endAngle, getChildren(data).length)[index]
              const prevR = this.calcPrevR()
              const r = prevR * (1 + 0.5 / Math.sqrt(cursor.length + 1))
              const x = cx + Math.sin(position) * r
              const y = cy - Math.cos(position) * r

              const includedAngle = this.calcIncludedAngle([px, py], [cx, cy], [x, y])
              return {
                key: `${getId(child) || index}`,
                data: child,
                style: {
                  x: spring(x),
                  y: spring(y),
                  includedAngle,
                  rotate: spring(0),
                  opacity: spring(1),
                  enteringFlag: spring(0)
                }
              }
            })}
            willEnter={() => ({
              x: this.direction === 0 ? px : cx,
              y: this.direction === 0 ? py : cy - this.calcPrevR() * (1 + 0.5 / Math.sqrt(cursor.length + 1)),
              rotate: -(90 / 180 * Math.PI) * this.direction,
              opacity: 0,
              enteringFlag: 1
            })}
            willLeave={({style}) => ({
              x: this.direction === 0 ? spring(px) : style.x,
              y: this.direction === 0 ? spring(py) : style.y,
              rotate: spring((90 / 180 * Math.PI) * this.direction),
              opacity: this.direction === 0 ? 0 : spring(0),
              enteringFlag: 0
            })}
          >
            {
              interpolatedStyles => (
                <g>
                  {
                    interpolatedStyles.map(({style, data, key}, index) => {
                      const position = this.distribute(startAngle, endAngle, interpolatedStyles.length)[index]
                      const prevR = this.calcPrevR()
                      const r = prevR * (1 + 0.5 / Math.sqrt(cursor.length + 1))

                      let { includedAngle, x, y, rotate, opacity, originalX, originalY, enteringFlag } = style

                      return (
                        <g key={key} opacity={opacity} transform={`rotate(${rotate / Math.PI * 180}, ${cx}, ${cy})`}>
                          {
                            Math.abs(includedAngle) > 140 / 180 * Math.PI
                            ?
                            <line
                              x1={px}
                              y1={py - item.props.r}
                              x2={x}
                              y2={y}
                              fill="none"
                              stroke="#555555"
                              strokeOpacity={0.4}
                              strokeWidth={1}
                              opacity={Math.abs(rotate) < 0.01 ? 1 : 0}
                            />
                            :
                            <path
                              fill="none"
                              stroke="#555555"
                              strokeOpacity={0.4}
                              strokeWidth={1}
                              d={this.calcCurvePath([px, py - item.props.r], [x, y])}
                              opacity={Math.abs(rotate) < 0.01 ? 1 : 0}
                            />
                          }
                          <Ring
                            cx={cx}
                            cy={cy}
                            px={x}
                            py={y}
                            data={data}
                            cursor={cursor.concat([index])}
                            renderItem={renderItem}
                            minRadius={minRadius}
                            maxRadius={maxRadius * 0.9}
                            range={childrenRange}
                            dispatch={this.props.dispatch}
                            enteringFlag={this.direction !== 0 && enteringFlag}
                          />
                        </g>
                      )
                    })
                  }
                </g>
              )
            }
          </TransitionMotion>
          :
          null
        }
      </g>
    )
  }
}

export default Ring
