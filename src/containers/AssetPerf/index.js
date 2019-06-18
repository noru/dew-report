import React from 'react'
import { connect } from 'dva'
import moment from 'moment'
import BubbleChart from '#/components/AssetPerf/BubbleChart'
import Loading from '#/components/AssetPerf/Loading'
import SidePanel from '#/components/AssetPerf/SidePanel'
import FilterBar from 'dew-filterbar'
import styles from './index.scss'
import { IsHead } from '#/utils'

const isHead = IsHead()

class AssetPerf extends React.PureComponent {
  onFilterChange = ({key, value}) => {
    const { dispatch } = this.props
    if (key === 'type') {
      dispatch({
        type: 'filters/type/set',
        payload: value
      })
    } else if (key === 'range') {
      dispatch({
        type: 'filters/range/set',
        payload: value
      })
    } else if (key === 'groupBy') {
      dispatch({
        type: 'filters/groupBy/set',
        payload: value
      })
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.profit === this.props.profit) return false
    return true
  }

  render() {
    const { profit, filters } = this.props
    const { data } = profit
    const { groupBy, data: filtersData, type } = filters
    if (data.length === 0) return null
    const chartData = data
      .reduceRight((prev, cur, index) => {
        const i = cur.items.findIndex(item => item.root.id === filtersData[data.length - 1 - index][groupBy])
        if (i >= 0) {
          return {
            ...cur,
            items: cur.items.slice(0, i).concat([{...prev, root: {...cur.items[i].root}}]).concat(cur.items.slice(i + 1, cur.items.length))
          }
        }
        return cur
      })

    const filterOptions = [
      /* As Jianbin's request, hide '预测' option for the time being. */
      // { type: 'radio', key: 'type', options: [{id: 'history', name: '历史'}, {id: 'future', name: '预测'}], value: type},
      { type: 'range', key: 'range', value: filters.range },
      { type: 'radio', key: 'groupBy', options: [{id: 'type', name: '按设备类型'}, {id: 'month', name: '按月份'}], value: groupBy},
    ]
    if (isHead) filterOptions[1].options.unshift({id: 'dept', name: '按科室'})
    return (
      <div className={styles['asset-perf']}>
        <div className="filter-bar">
          <FilterBar options={filterOptions} onChange={this.onFilterChange}/>
        </div>
        <BubbleChart data={chartData} depth={data.length} type={type}/>
        {
          filters.type === 'future'
          ? <SidePanel className={styles['side-panel']} />
          : null
        }
        <Loading />
      </div>
    )
  }
}

export default
connect(({ profit, filters }) => ({ profit, filters }))(AssetPerf)
