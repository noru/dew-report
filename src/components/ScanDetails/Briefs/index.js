import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import { groupBy, flatMap } from 'lodash'
import { showTooltip, hideTooltip } from '#/utils/tooltip'
import { ellipsis } from '#/utils/helpers'
import styles from './index.scss'

@connect(({briefs, ScanDetails_filters}) => ({briefs, filters: ScanDetails_filters}))
export default
class Briefs extends React.PureComponent {
  Tooltip = props => (
    <div className={styles['tooltip']}>
        <div>{props.data.type.name}</div>
        <div>{props.data.items.data.reduce((prev, cur) => prev + cur.count, 0)}</div>
    </div>
  )

  onClick = id => e => this.props.dispatch({
    type: 'ScanDetails_filters/cursor/toggle',
    payload: {
      key: 'type',
      value: id
    }
  })
  render() {
    const { briefs, filters } = this.props
    const { cursor } = filters
    const counts = briefs.data.map(brief => brief.items.data.reduce((prev, cur) => cur.count + prev, 0))
    const maxCount = Math.max(...counts)
    return (
      <div className={styles['briefs']}>
        <RingSectorLayout
          startAngle={0}
          endAngle={-Math.PI}
          getCx={(width, height) => width}
          getCy={(width, height) => height / 2}
          items={briefs.data}
          animationDirection={this.animationDirection}
        >
          {
            (item, index, innerRadius, outerRadius) => {
              const span = -Math.PI / Math.max(15, briefs.data.length)

              const startAngle = item.style.position - span / 2
              const endAngle = item.style.position + span / 2
              return (
                <Motion
                  key={item.data.type.id}
                  defaultStyle={{opacity: 1}}
                  style={{opacity: spring(cursor['type'] === undefined ? 1 : cursor['type'] === item.data.type.id ? 1 : 0.4)}}
                >
                  {
                    style => (
                      <g
                        opacity={style.opacity}
                        style={{cursor: 'pointer'}}
                        onClick={this.onClick(item.data.type.id)}
                        onMouseOver={e => showTooltip(e, item, this.Tooltip)}
                        onMouseOut={e => hideTooltip(e)}
                      >
                        <AnnulusSectorStack
                          opacity={item.style.progress}
                          innerRadius={innerRadius}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          text={{
                            content: ellipsis(item.data.type.name, 8),
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
      </div>
    )
  }
}
