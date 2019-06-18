import React from 'react'
import { Row, Col, Slicer } from 'antd'
import { flow } from 'noru-utils/lib'
import { translate } from 'react-i18next'
import { connect } from 'dva'
import AssetOverview from './components/AssetOverview'
import AssetsInMaintain from './components/AssetsInMaintain'
import ResponseTime from './components/ResponseTime'
import './index.scss'

export class Nurse extends React.Component {


  refresh() {
    let { dispatch } = this.props
    dispatch({ type: 'Nurse/get/all' })
  }
  componentDidMount() {
    this.refresh()
  }

  render() {

    return (
      <Row gutter={16} className="nurse-station">
        <Col span="8" className="left-container">
          <AssetOverview />
        </Col>
        <Col span="16" className="right-container">
          <AssetsInMaintain />
          <ResponseTime />
        </Col>
      </Row>
    )
  }

}

export default flow(
  Nurse,
  translate(),
  connect(),
)