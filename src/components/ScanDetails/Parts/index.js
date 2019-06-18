import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import { groupBy, flatMap } from 'lodash'
import { showTooltip, hideTooltip } from '#/utils/tooltip'
import styles from './index.scss'

@connect(({briefs, assets, ScanDetails_filters}) => ({briefs, assets, filters: ScanDetails_filters}))
export default
class Parts extends React.PureComponent {
  Tooltip = props => (
    <div className={styles['tooltip']}>
      <div>{this.props.briefs.parts[props.data.id].name}</div>
      <div>{props.data.count}</div>
    </div>
  )

  onClick = id => e => this.props.dispatch({
    type: 'ScanDetails_filters/cursor/toggle',
    payload: {
      key: 'part',
      value: id
    }
  })

  render() {

    const { briefs, assets, filters } = this.props
    const { parts } = briefs
    const { cursor } = filters
    let data

    if (cursor['asset'] === undefined) {
      data = briefs.data
      const groupedByParts = groupBy(flatMap(data, datum => datum.items.data), item => item.id)
      data = Object.entries(groupedByParts).map(([k, v]) => ({
        id: k,
        count: v.reduce((prev, cur) => prev + cur.count, 0)
      }))
    } else {
      const asset = assets.data.find(datum => datum.asset.id === cursor['asset'])
      data = asset.items.data
    }

    const maxCount = Math.max(...data.map(({count}) => count))
    return (
      <div className={styles['parts']}>
        <RingSectorLayout
          startAngle={0}
          endAngle={-Math.PI}
          getCx={(width, height) => width}
          getCy={(width, height) => height / 2}
          getInnerRadius={(width, height) => 0.45 * Math.min(width, height / 2)}
          getOuterRadius={(width, height) => 0.65 * Math.min(width, height / 2)}
          items={data}
          animationDirection={this.animationDirection}
        >
          {
            (item, index, innerRadius, outerRadius) => {
              const span = -Math.PI / Math.max(15, data.length)

              const startAngle = item.style.position - span / 2
              const endAngle = item.style.position + span / 2
              return (
                <Motion
                  key={item.data.id}
                  defaultStyle={{opacity: 1}}
                  style={{opacity: spring(cursor['part'] === undefined ? 1 : cursor['part'] === item.data.id ? 1 : 0.4)}}
                >
                  {
                    style => (
                      <g
                        opacity={style.opacity}
                        style={{cursor: 'pointer'}}
                        onClick={this.onClick(item.data.id)}
                        onMouseOver={e => showTooltip(e, item, this.Tooltip)}
                        onMouseOut={e => hideTooltip(e)}
                      >
                        <AnnulusSectorStack
                          opacity={item.style.progress}
                          innerRadius={innerRadius}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          text={{
                            content: (parts[item.data.id] && parts[item.data.id].name) || '其他',
                            offset: (outerRadius - innerRadius) / 10,
                            fontSize: (outerRadius - innerRadius) / 5,
                            fill: '#8c8c8c'
                          }}
                          sectors={[{
                            id: item.data.id,
                            width: Math.min(item.data.count / maxCount, 1) * (outerRadius - innerRadius),
                            fill: parts[item.data.id] ? parts[item.data.id].color : 'transparent'
                          }]}
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
