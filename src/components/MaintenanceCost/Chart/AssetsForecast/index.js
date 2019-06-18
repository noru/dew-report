// @flow
import React from 'react'
import { connect } from 'dva'
import RingSectorLayout, { AnnulusSectorStack } from 'ring-sector-layout'
import DewPager from 'dew-pager'
import { Motion, spring } from 'react-motion'
import { Select } from 'antd'
import classnames from 'classnames'
import { THRESHOLD_COLORS } from '#/constants'
import { PAGE_SIZE } from '#/models/MaintenanceCost/assets'
import styles from './index.scss'

type Props = {
  className?: string,
  assets: any,
  thresholds: any,
  filters: any
}


class AssetsForecast extends React.PureComponent<*, Props, *> {
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

  onMSAChange = e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/field/set',
      payload: {
        key: 'MSA',
        value: e
      }
    })
  }

  animationDirection = 0

  componentWillReceiveProps(nextProps) {
    if (nextProps.assets.loading !== this.props.assets.loading) return
    if (nextProps.assets.index !== this.props.assets.index) return
    if (nextProps.thresholds !== this.props.thresholds) return
    if (nextProps.assets.rate !== this.props.assets.rate) return
    if (nextProps.assets.data === this.props.assets.data) this.animationDirection = 0
  }

  render() {
    const { assets, thresholds, filters, className } = this.props
    const { data: items, index, total } = assets
    const keys = filters.target === 'acyman' ? ['labor', 'parts'] : ['repair', 'PM']
    const { cursor, MSA } = filters

    return (
      <div className={classnames(className, styles['assets-predict'])}>
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
              let color
              const sum = keys.reduce((prev, cur) => prev + item.data[cur],0)
              const { onrate } = item.data
              if (onrate < thresholds[0][0]) color = THRESHOLD_COLORS[0]
              else if (sum > thresholds[1][0]) color = THRESHOLD_COLORS[1]
              else if (onrate > thresholds[2][0] && onrate < thresholds[2][1] && sum > thresholds[2][2] - thresholds[2][3] && sum < thresholds[2][2] + thresholds[2][3]) color = THRESHOLD_COLORS[2]
              else color = 'black'
              return (
                <Motion
                  key={item.data.id}
                  defaultStyle={{ opacity: 1 }}
                  style={{ opacity: spring(cursor[1] === undefined ? 1 : cursor[1] === item.data.id ? 1 : 0.4)}}
                >
                  {
                    style => (
                      <AnnulusSectorStack
                        onClick={this.onClick(item)}
                        opacity={style.opacity * item.style.progress}
                        style={{cursor: 'pointer'}}
                        innerRadius={innerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        text={{
                          content: item.data.name,
                          offset: (outerRadius - innerRadius) / 10,
                          fontSize: (outerRadius - innerRadius) / 4,
                          fill: color,
                        }}
                        sectors={[]}
                      />
                    )
                  }
                </Motion>
              )
            }
          }
        </RingSectorLayout>
        <Select
          className={styles['MSA']}
          showSearch
          allowClear
          onChange={this.onMSAChange}
          value={MSA === undefined ? undefined : String(MSA)}
          placeholder="全部"
          style={{width: 100}}
        >
          <Select.Option value="yes">建议购买MSA</Select.Option>
          <Select.Option value="no">不建议购买MSA</Select.Option>
        </Select>
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

export default connect(({MaintenanceCost_assets, thresholds, MaintenanceCost_filters}) => ({assets: MaintenanceCost_assets, thresholds, MaintenanceCost_filters}))(AssetsForecast)
