import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import { withClientRect } from 'react-HOCs'
import Arrow from '#/components/ScanDetails/Arrow'
import { PAGE_SIZE } from '#/models/ScanDetails/steps'
import { groupBy, flatMap } from 'lodash'
import { showTooltip, hideTooltip } from '#/utils/tooltip'
import styles from './index.scss'

@withClientRect
@connect(({briefs, steps, ScanDetails_filters}) => ({briefs, steps, filters: ScanDetails_filters}))
export default
class Steps extends React.PureComponent {
  Tooltip = props => (
    <div className={styles['tooltip']}>
      <div>{props.data.type.name}</div>
      <div>{this.props.briefs.parts[props.data.part.id].name}</div>
      <div>{props.data.step.name}</div>
      <div>{props.data.step.count}</div>
    </div>
  )

  onPageChange = diff => e => {
    if (0 > diff + this.props.steps.index) return
    else if (diff > 0 && PAGE_SIZE + 1 > this.props.steps.data.length ) return
    else {
      this.props.dispatch({
        type: 'steps/page/change',
        payload: diff
      })
    }
  }

  getRadius = ratio => (width, height) => ratio * Math.min(width, height / 2)

  getTopY(width, height, innerRatio, outerRatio) {
    const innerRadius = this.getRadius(innerRatio)(width, height)
    const outerRadius = this.getRadius(outerRatio)(width, height)
    return height / 2 - (outerRadius + innerRadius) / 2
  }

  getBottomY(width, height, innerRatio, outerRatio) {
    const innerRadius = this.getRadius(innerRatio)(width, height)
    const outerRadius = this.getRadius(outerRatio)(width, height)
    return height / 2 + (outerRadius + innerRadius) / 2
  }

  render() {
    const { briefs, steps, filters, clientRect } = this.props
    const { width, height } = clientRect
    const { parts } = briefs
    const { cursor } = filters
    const counts = steps.data.map(datum => datum.step.count)
    const maxCount = Math.max(...counts)
    return (
      <div className={styles['steps']}>
        <Motion
          defaultStyle={{
            innerRatio: 0.5,
            outerRatio: 0.5,
            opacity: 0
          }}
          style={{
            innerRatio: spring((cursor['type'] || cursor['asset']) ? 0.5 : 0.5),
            outerRatio: spring((cursor['type'] || cursor['asset']) ? 0.7 : 0.5),
            opacity: spring((cursor['type'] || cursor['asset']) ? 1 : 0)
          }}
        >
          {
            ({innerRatio, outerRatio, opacity}) => (
              <div className={styles['container']} style={{opacity}}>
                <RingSectorLayout
                  startAngle={0}
                  endAngle={Math.PI}
                  getCx={(width, height) => 0}
                  getCy={(width, height) => height / 2}
                  getInnerRadius={this.getRadius(innerRatio)}
                  getOuterRadius={this.getRadius(outerRatio)}
                  items={steps.data.slice(0, PAGE_SIZE)}
                  getItemId={item => `${item.step.id}`}
                  animationDirection={steps.animationDirection}
                >
                  {
                    (item, index, innerRadius, outerRadius) => {
                      const span = -Math.PI / Math.max(20, steps.data.length - 1)

                      const startAngle = item.style.position - span / 2
                      const endAngle = item.style.position + span / 2
                      return (
                        <g
                          key={item.data.step.id}
                          style={{cursor: 'pointer'}}
                          onMouseOver={e => showTooltip(e, item, this.Tooltip)}
                          onMouseOut={e => hideTooltip(e)}
                        >
                          <AnnulusSectorStack
                            opacity={item.style.progress}
                            innerRadius={innerRadius}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            text={{
                              content: item.data.step.name,
                              offset: (outerRadius - innerRadius) / 10,
                              fontSize: (outerRadius - innerRadius) / 5,
                              fill: '#8c8c8c'
                            }}
                            sectors={[{
                              id: item.data.step.id,
                              width: item.data.step.count / maxCount * (outerRadius - innerRadius),
                              fill: briefs.parts[item.data.part.id] ? briefs.parts[item.data.part.id].color : 'transparent'
                            }]}
                          />
                        </g>
                      )
                    }
                  }
                </RingSectorLayout>
                <Arrow
                  className={styles['prev']}
                  disabled={steps.index <= 0}
                  style={{
                    top: `${this.getTopY(width, height, innerRatio, outerRatio)}px`,
                    right: '100%'
                  }}
                  onClick={this.onPageChange(-1)}
                />
                <Arrow
                  className={styles['next']}
                  disabled={steps.data.length < PAGE_SIZE + 1}
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
