// @flow
import React from 'react'
import { connect } from 'dva'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import DewPager from 'dew-pager'
import { Motion, spring } from 'react-motion'
import classnames from 'classnames'
import { PAGE_SIZE } from '#/models/MaintenanceCost/assets'
import { MC_COLORS } from '#/constants'
import styles from './index.scss'

type Props = {
  className?: string,
  assets: {
    loading: boolean,
    data: Array<*>,
    pastData: Array<*>
  },
  filters: any
}


class Assets extends React.PureComponent<*, Props, *> {
  onClick = item => e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/cursor/toggle',
      payload: item.data.id,
      level: 2
    })
  }

  onPageChange = (currentPage, last) => {
    this.animationDirection = currentPage - last
    this.props.dispatch({
      type: 'MaintenanceCost_assets/page/change',
      payload: currentPage - 1
    })
  }

  animationDirection = 0

  componentWillReceiveProps(nextProps) {
    if (nextProps.assets.index !== this.props.assets.index) return
    if (nextProps.assets.data === this.props.assets.data) this.animationDirection = 0
  }

  render() {
    const { assets, filters, className } = this.props
    const { data: items, index, total } = assets
    const { target, cursor } = filters

    const keys = target === 'acyman' ? ['labor', 'parts'] : ['repair', 'PM']

    const counts = items.map((item) => keys.reduce((prev, cur) => prev + item[cur], 0))
    const [ minCount, maxCount ] = [ Math.min(...counts), Math.max(...counts) ]

    return (
      <div className={classnames(className, styles['assets'])}>
        <RingSectorLayout
          startAngle={0}
          endAngle={Math.PI}
          getCx={(width, height) => 0}
          getCy={(width, height) => height / 2}
          items={items}
          animationDirection={this.animationDirection}
        >
          {
            (item, index, innerRadius, outerRadius) => {
              const span = Math.PI / Math.max(30, items.length)
              const startAngle = item.style.position - span / 2
              const endAngle = item.style.position + span / 2
              return (
                <Motion
                  key={item.data.id}
                  defaultStyle={{ opacity: 1 }}
                  style={{ opacity: spring(cursor[1] === undefined ? 1 : cursor[1] === item.data.id ? 1 : 0.4)}}
                >
                  {
                    style => (
                      <AnnulusSectorStack
                        style={{cursor: 'pointer'}}
                        opacity={style.opacity * item.style.progress}
                        onClick={this.onClick(item)}
                        innerRadius={innerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        text={{
                          content: item.data.name,
                          offset: (outerRadius - innerRadius) / 10,
                          fontSize: (outerRadius - innerRadius) / 5,
                          fill: '#8c8c8c'
                        }}
                        sectors={keys.map(key => ({
                          id: key,
                          width: item.data[key] / maxCount * (outerRadius - innerRadius),
                          fill: MC_COLORS[key]
                        }))}
                      />
                    )
                  }
                </Motion>
              )
            }
          }
        </RingSectorLayout>
        <DewPager
          current={index + 1}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={this.onPageChange}
        />
      </div>
    )
  }
}

export default connect(({MaintenanceCost_filters, MaintenanceCost_assets}) => ({filters: MaintenanceCost_filters, assets: MaintenanceCost_assets}))(Assets)
