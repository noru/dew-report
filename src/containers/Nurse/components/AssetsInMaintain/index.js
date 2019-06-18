import React from 'react'
import { Table } from 'antd'
import { flow } from 'noru-utils/lib'
import { translate } from 'react-i18next'
import { connect } from 'dva'
import moment from 'moment'
import { strLocaleComparator, numComparator } from '#/utils'
import { getComparator } from '../AssetOverview'
import './index.scss'

class MalfunctionTable extends React.Component {

  state = {
    tableScrollY: 0,
  }

  getCols = () => {
    let { t, assets } = this.props
    return [
      {
        title: t`设备名称`,
        dataIndex: 'assetName',
        sorter: getComparator('assetName', strLocaleComparator),
        width: '20%',
      },
      {
        title: t`资产编号`,
        dataIndex: 'financingNum',
        sorter: getComparator('financingNum', strLocaleComparator),
        width: '20%',
      },
      {
        title: t`报修日期`,
        render: record => moment(record.reportDate).format('YYYY-MM-DD HH:mm'),
        sorter: getComparator('reportDate', (a, b) => moment(a).unix() - moment(b).unix()),
        width: '20%',
      },
      {
        title: t`报修人`,
        dataIndex: 'reporter',
        sorter: getComparator('reporter', strLocaleComparator),
        width: '15%',
      },
      {
        title: t`使用科室`,
        dataIndex: 'clinicalDept',
        sorter: getComparator('clinicalDept', strLocaleComparator),
        width: '15%',
      },
      {
        title: t`状态`,
        dataIndex: 'status',
        sorter: getComparator('status', strLocaleComparator),
        width: '10%',
      },
    ]
  }

  componentDidMount() {
    let [ table ] = document.getElementsByClassName('asset-in-maintain-table')
    this.setState({ tableScrollY: table.offsetHeight - 20 })
  }

  render() {
    let { t, data } = this.props
    let { tableScrollY } = this.state
    return (
      <Table
        dataSource={data}
        columns={this.getCols(t)}
        className="asset-table asset-in-maintain-table"
        pagination={false}
        scroll={{ y: tableScrollY }}
      />
    )
  }
}


export class AssetsInMaintain extends React.Component {

  render() {
    let { t, assets } = this.props

    return (
      <div className="assets-in-maintain">

        <h1>{t`报修中的设备`}({assets.length})</h1>

        <div className="assets-in-maintain-content">
          <MalfunctionTable t={t} data={assets} />
        </div>

      </div>
    )
  }

}

function mapState2Props(state) {
  return {
    assets: state.Nurse.assetsInMaintain
  }
}

export default flow(
  AssetsInMaintain,
  translate(),
  connect(mapState2Props)
)