import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import { withClientRect } from 'react-HOCs'
import { groupBy, flatMap } from 'lodash'
import Arrow from '#/components/ScanDetails/Arrow'
import { PAGE_SIZE } from '#/models/ScanDetails/assets'
import { showTooltip, hideTooltip } from '#/utils/tooltip'
import { ellipsis } from '#/utils/helpers'
import styles from './index.scss'

@withClientRect
@connect(({briefs, assets, ScanDetails_filters}) => ({briefs, assets, filters: ScanDetails_filters}))
export default
class Assets extends React.PureComponent {
  Tooltip = props => (
    <div className={styles['tooltip']}>
        <div>{props.data.asset.name}</div>
        {props.data.items.data.map(datum => (
          <div key={datum.id}>
            <span>{this.props.briefs.parts[datum.id].name}</span>
            <span>{datum.count}</span>
          </div>
        ))}
    </div>
  )

  onClick = id => e => this.props.dispatch({
    type: 'ScanDetails_filters/cursor/toggle',
    payload: {
      key: 'asset',
      value: id
    }
  })

  onPageChange = diff => e => {
    if (0 > diff + this.props.assets.index) return
    else if (diff > 0 && PAGE_SIZE + 1 > this.props.assets.data.length ) return
    else {
      this.props.dispatch({
        type: 'ScanDetails_filters/cursor/toggle',
        payload: {
          key: 'asset',
          value: this.props.filters.cursor.asset
        }
      })
      this.props.dispatch({
        type: 'assets/page/change',
        payload: diff
      })
    }
  }

  getInnerRadius = innerRatio => (width, height) => innerRatio * Math.min(width, height / 2)

  getOuterRadius = outerRatio => (width, height) => outerRatio * Math.min(width, height / 2)

  getTopY(width, height, innerRatio, outerRatio) {
    const innerRadius = this.getInnerRadius(innerRatio)(width, height)
    const outerRadius = this.getOuterRadius(outerRatio)(width, height)
    return height / 2 - (outerRadius + innerRadius) / 2
  }

  getBottomY(width, height, innerRatio, outerRatio) {
    const innerRadius = this.getInnerRadius(innerRatio)(width, height)
    const outerRadius = this.getOuterRadius(outerRatio)(width, height)
    return height / 2 + (outerRadius + innerRadius) / 2
  }

  render() {
    const { briefs, assets, filters, clientRect } = this.props
    const { width, height } = clientRect
    const { cursor } = filters
    const counts = assets.data.map(asset => asset.items.data.reduce((prev, cur) => cur.count + prev, 0))
    const maxCount = Math.max(...counts)

    return (
      <div className={styles['assets']}>
        <Motion
          defaultStyle={{
            innerRatio: 0.6,
            outerRatio: 0.85
          }}
          style={{
            innerRatio: spring((cursor['type'] || cursor['asset']) ? 0.75 : 0.6),
            outerRatio: spring((cursor['type'] || cursor['asset']) ? 0.95 : 0.85),
          }}
        >
          {
            ({innerRatio, outerRatio}) => (
              <div className={styles['container']}>
                <RingSectorLayout
                  startAngle={0}
                  endAngle={Math.PI}
                  getCx={(width, height) => 0}
                  getCy={(width, height) => height / 2}
                  getInnerRadius={this.getInnerRadius(innerRatio)}
                  getOuterRadius={this.getOuterRadius(outerRatio)}
                  items={assets.data.slice(0, PAGE_SIZE)}
                  getItemId={item => `${item.asset.id}`}
                  animationDirection={assets.animationDirection}
                >
                  {
                    (item, index, innerRadius, outerRadius) => {
                      const span = -Math.PI / Math.max(20, assets.data.length - 1)

                      const startAngle = item.style.position - span / 2
                      const endAngle = item.style.position + span / 2

                      return (
                        <Motion
                          key={item.data.asset.id}
                          defaultStyle={{opacity: 1}}
                          style={{opacity: spring(cursor['asset'] === undefined ? 1 : cursor['asset'] === item.data.asset.id ? 1 : 0.4)}}
                        >
                          {
                            style => (
                              <g
                                onMouseOver={e => showTooltip(e, item, this.Tooltip)}
                                onMouseOut={e => hideTooltip(e)}
                                opacity={style.opacity}
                                style={{cursor: 'pointer'}}
                                onClick={this.onClick(item.data.asset.id)}
                              >
                                <AnnulusSectorStack
                                  opacity={item.style.progress}
                                  innerRadius={innerRadius}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  text={{
                                    content: ellipsis(item.data.asset.name, 7),
                                    offset: (outerRadius - innerRadius) / 10,
                                    fontSize: (outerRadius - innerRadius) / 5,
                                    fill: '#8c8c8c'
                                  }}
                                  sectors={item.data.items.data.map(datum => ({
                                    id: datum.id,
                                    width: datum.count / maxCount * (outerRadius - innerRadius),
                                    fill: briefs.parts[datum.id] ? briefs.parts[datum.id].color : 'transparent'
                                  }))}
                                />
                              </g>
                            )
                          }
                        </Motion>
                      )
                    }
                  }
                </RingSectorLayout>
                <Arrow
                  className={styles['prev']}
                  disabled={assets.index <= 0}
                  style={{
                    top: `${this.getTopY(width, height, innerRatio, outerRatio)}px`,
                    right: '100%'
                  }}
                  onClick={this.onPageChange(-1)}
                />
                <Arrow
                  className={styles['next']}
                  disabled={assets.data.length < PAGE_SIZE + 1}
                  style={{
                    top: `${this.getBottomY(width, height, innerRatio, outerRatio)}px`,
                    right: '100%'
                  }}
                  onClick={this.onPageChange(1)}
                />
              </div>
            )
          }
        </Motion>
      </div>
    )
  }
}
