// @flow
import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import { Select } from 'antd'
import RingSectorLayout, { AnnulusSector, AnnulusSectorStack } from 'ring-sector-layout'
import DewPager from 'dew-pager'
import classnames from 'classnames'
import { PAGE_SIZE } from '#/models/MaintenanceCost/groups'
import { MC_COLORS, PAST_COLORS } from '#/constants'
import styles from './index.scss'

type Props = {
  className?: string,
  groups: {
    loading: boolean,
    data: Array<*>,
    pastData: Array<*>
  },
  filters: any
}

class Groups extends React.PureComponent<*, Props, *> {
  onClick = item => e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/cursor/toggle',
      payload: item.data.id,
      level: 1
    })
  }

  onPageChange = (currentPage, lastPage) => {
    this.animationDirection = currentPage - lastPage
    this.props.dispatch({
      type: 'groups/page/change',
      payload: currentPage - 1
    })
  }

  onGroupByChange = e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/field/set',
      payload: {
        key: 'groupBy',
        value: e
      }
    })
  }

  animationDirection = 0

  componentWillReceiveProps(nextProps) {
    if (nextProps.groups.index !== this.props.groups.index) return
    if (nextProps.groups.data === this.props.groups.data) this.animationDirection = 0
  }

  render() {
    const { groups, filters, className } = this.props
    const { data, pastData, loading, index, total } = groups
    const { target, cursor, groupBy } = filters

    const keys = target === 'acyman' ? ['labor', 'parts'] : ['repair', 'PM']

    const counts = data.map((datum) => keys.reduce((prev, cur) => prev + datum[cur], 0))
    const pastCounts = pastData.map((datum) => keys.reduce((prev, cur) => prev + datum[cur], 0))
    const [ minCount, maxCount ] = [ Math.min(...counts, ...pastCounts), Math.max(...counts, ...pastCounts) ]

    return (
      <div
        className={classnames(className, styles['groups'])}
      >
        <RingSectorLayout
          startAngle={0}
          endAngle={-Math.PI}
          getCx={(width, height) => width}
          getCy={(width, height) => height / 2}
          items={data}
          animationDirection={this.animationDirection}
        >
          {
            (item, index, innerRadius, outerRadius) => {
              const span = -Math.PI / Math.max(12, data.length)
              const pastItem = pastData.find(i => i.id === item.data.id)
              let pastRs
              if (pastItem) {
                pastRs = keys
                  .map(key => pastItem[key])
                  .reduce((prev, cur) => prev.concat((prev[prev.length - 1] || 0) + cur), [])
                  .map(v => innerRadius + v / maxCount * (outerRadius - innerRadius))
              } else {
                pastRs = []
              }

              const startAngle = item.style.position - span / 2
              const endAngle = item.style.position + span / 2
              return (
                <Motion
                  key={item.data.id}
                  defaultStyle={{opacity: 1}}
                  style={{opacity: spring(cursor[0] === undefined ? 1 : cursor[0] === item.data.id ? 1 : 0.4)}}
                >
                  {
                    style => (
                      <g onClick={this.onClick(item)} opacity={style.opacity} style={{cursor: 'pointer'}}>
                        <AnnulusSectorStack
                          opacity={item.style.progress}
                          innerRadius={innerRadius}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          text={{
                            content: item.data.name,
                            offset: (outerRadius - innerRadius) / 10,
                            fontSize: (outerRadius - innerRadius) / 4,
                            fill: '#8c8c8c'
                          }}
                          sectors={keys.map(key => ({
                            id: key,
                            width: item.data[key] / maxCount * (outerRadius - innerRadius),
                            fill: MC_COLORS[key]
                          }))}
                        />
                        {
                          pastRs.map((radius, index) => (
                            <AnnulusSector
                              key={keys[index]}
                              innerRadius={radius}
                              outerRadius={radius}
                              startAngle={startAngle}
                              endAngle={endAngle}
                              stroke={PAST_COLORS[keys[index]]}
                            />
                          ))
                        }
                      </g>
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
        <Select
          className={styles['group-by']}
          onChange={this.onGroupByChange}
          value={groupBy}
        >
          <Select.Option value="type">显示设备类型</Select.Option>
          <Select.Option value="supplier">显示品牌</Select.Option>
          <Select.Option value="dept">显示科室</Select.Option>
        </Select>
      </div>
    )
  }
}

export default connect(({ MaintenanceCost_filters, groups }) => ({ filters: MaintenanceCost_filters, groups }))(Groups)
