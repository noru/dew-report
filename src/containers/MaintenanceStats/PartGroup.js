/* @flow */
import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import RingSectorLayout from 'ring-sector-layout'
import AnnulusSectorStack from 'ring-sector-layout/dist/AnnulusSectorStack'

import { formatData } from './helper'
import styles from './styles.scss'

const purple = '#b781b4'
const prasinous = '#6ab6a6'

type PropsT = {
  data: Array<Object>,
  switcher: string,
  animationDirection: number,
  onClick: Function,
  selectedGroupId: string
}

@connect()
export default class PartGroup extends PureComponent<*, PropsT, *> {
  render () {
    const { data, switcher, animationDirection, onClick, selectedGroupId } = this.props

    const chartData = formatData(data).map(n => {
      return {
        id: n.id,
        name: n.name,
        origin: n.origin,
        children: n[switcher]
      }
    })

    const startAngle = 10 / 180 * Math.PI
    const endAngle = 170 / 180 * Math.PI
    const range = endAngle - startAngle

    return (
      <RingSectorLayout
        startAngle={-startAngle}
        endAngle={-endAngle}
        getCx={width => width}
        getCy={(width, height) => height / 2}
        items={chartData}
        animationDirection={animationDirection || 0}>
        {
          (item, index, innerRadius, outerRadius) => {
            const span = Math.min(range / 18, range / (chartData.length + 1))
            const { data } = item

            // `id` typed String
            const opacity = selectedGroupId ? selectedGroupId == item.data.id ? 1 : 0.3 : item.style.progress

            return (
              <AnnulusSectorStack
                key={item.key}
                startAngle={item.style.position - span / 2}
                endAngle={item.style.position + span / 2}
                innerRadius={innerRadius}
                sectors={data.children.map((item, i) => ({
                  width: (outerRadius - innerRadius) * item.value,
                  fill: item.color
                }))}
                text={{
                  content: data.name,
                  fontSize: 16,
                  className: styles.text,
                  offset: (outerRadius - innerRadius) / 10
                }}
                onClick={onClick(item.data.id, item.data.origin)}
                opacity={opacity} />
            )
          }
        }
      </RingSectorLayout>
    )
  }
}
