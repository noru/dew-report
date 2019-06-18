import React from 'react'
import { connect } from 'dva'
import EditBlock from 'dew-editblock'
import { Table } from 'antd'
import { round } from '#/utils'
import styles from './index.scss'

class Manual extends React.PureComponent {
  onGroupClick = id => e => {
    this.props.dispatch({
      type: 'MaintenanceCost_filters/cursor/toggle',
      payload: id,
      level: 1,
      noReset: true
    })
  }
  handleChange = id => field => value => this.props.dispatch({
    type: 'assets/rate/change',
    payload: Number(value) / 100,
    field,
    id
  })

  onAssetClick = ({id}) => {
    if (id === this.props.filters.cursor[1]) return
    this.props.dispatch({
      type: 'MaintenanceCost_filters/cursor/toggle',
      payload: id,
      level: 2,
      noReset: true
    })
  }

  render() {
    const { filters, groups, assets } = this.props
    const { target, cursor } = filters
    const { rate } = assets
    const columns = [
      {title: '', width: '30%', dataIndex: 'name', key: 'name', className: styles['asset-name']},
      {title: '开机率', width: '25%', key: 'onrate_increase', render: (text, record) => (
        <EditBlock
          className={styles.block}
          onChange={this.handleChange(record.id)('onrate_increase')}
          initialValue={String(round(record.onrate_increase * 100))}
          sign="%" />
      )},
      {title: (target === 'acyman' ? '人力' : '维修') + '成本', width: '25%', key: '1', render: (text, record) => (
        <EditBlock
          className={styles.block}
          onChange={this.handleChange(record.id)(target === 'acyman' ? 'labor_increase': 'repair_increase')}
          initialValue={String(round(record[target === 'acyman' ? 'labor_increase': 'repair_increase'] * 100))}
          sign="%" />
      )},
      {title: (target === 'acyman' ? '备件' : 'PM') + '成本', width: '20%', key: '2', render: (text, record) => (
        <EditBlock
          className={styles.block}
          onChange={this.handleChange(record.id)(target === 'acyman' ? 'parts_increase': 'PM_increase')}
          initialValue={String(round(record[target === 'acyman' ? 'parts_increase': 'PM_increase'] * 100))}
          sign="%" />
      )}
    ]
    return (
      <div className={styles['manual']}>
        <div>开机率和{target === 'acyman' ? '人力+备件' : '维修+PM'}预期增长</div>
        <ul className="m-b-1">
          <li
            data-active={cursor[0] === undefined || cursor[0] === null}
            onClick={this.onGroupClick(null)}
          >
            全部选中设备
          </li>
          {groups.data.map(datum => (
            <li
              key={datum.id}
              onClick={this.onGroupClick(datum.id)}
              data-active={cursor[0] === datum.id}
            >
              {datum.name}
            </li>
          ))}
        </ul>
        {
          cursor[0] !== undefined || cursor[0] !== null
          ? <Table
              className={styles['assets'] + ' m-b-1'}
              dataSource={rate}
              columns={columns}
              pagination={false}
              rowKey="id"
              rowClassName={record => record.id === cursor[1] ? 'row-active' : 'row-normal'}
              onRowClick={this.onAssetClick}
              scroll={{y: 100}}
            />
          : null
        }
      </div>
    )
  }
}

export default connect(({MaintenanceCost_filters, groups, MaintenanceCost_assets}) => ({filters: MaintenanceCost_filters, groups, assets: MaintenanceCost_assets}))(Manual)
