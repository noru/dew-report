//@flow
/* eslint camelcase:0 */
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import { memoize, clamp, range, get } from 'lodash-es'
import { message } from 'antd'
import EventBus from 'eventbusjs'
import GearListChart from 'react-gear-chart'
import Header from '#/containers/FailureAnalysis/Header'
import Legend from '#/components/FailureAnalysis/Legend'
import LegendTable from '#/components/FailureAnalysis/LegendTable'
import LastYearMarker from '#/components/FailureAnalysis/LastYearMarker'
import Pagination from '#/components/FailureAnalysis/Pagination'
import withClientRect from '../../../HOC/withClientRect'
import selectHelper from '#/components/common/SelectHelper'
import colors from '#/utils/colors'
import './app.scss'
import cache from '#/utils/cache'
import { DataTypeMapping } from '#/services'
import { ToPrecentage } from '#/utils/helpers'
import Tooltip from '#/components/common/Tooltip'

const Placeholder = { strips: { color: '#F9F9F9', weight: 1, type: 'placeholder' } }
const Items = [{ color: colors.blue, key: 'primary_failure' }, { color: colors.gray, key: 'secondary_failure' }]
const ParameterTypes = [
  { color: colors.purple, key: 'operation_rate' },
  { color: colors.yellow, key: 'ftfr', type: 'radio' },
  { color: colors.green, key: 'incident_count' },
]
const CheckBoxes = [{ color: colors.red, key: 'same_period_last_year' }]
const DisplayOptions = [
  { key: 'display_asset_type' },
  // { key: 'display_brand' }, // hide "品牌" choice as requested
  { key: 'display_dept' },
]

function DataOrPlaceHolder(items, placeholderSize) {
  // ignore placeholder and empty data
  if (items && items.length && items[0].strips.type !== 'placeholder') {
    return items
  }
  return App.getPlaceholder(placeholderSize)
}

function getCurrentPage(skip, top) {
  return Math.ceil((skip + 1) / top)
}

function ensureSize(width, height) {
  width = clamp(width, 1000, 1300)
  if (height < 900) {
    width = 1100
  }
  return {
    outer_R: width * 0.275,
    outer_r: width * 0.2,
    inner_R: width * 0.175,
    inner_r: width * 0.142,
  }
}

function mapDispatch2Props(dispatch) {
  return {
    init: () => dispatch({ type: 'FailureAnalysis/get/all' }),
    updateDisplayType: value => {
      dispatch({ type: 'FailureAnalysis/update/display', data: value.key })
    },
    fetchBriefs: (chart, pageNumber, params) => {
      dispatch({ type: 'FailureAnalysis/get/briefs', data: { chart, value: pageNumber, ...params } })
    },
    fetchReasons: (data = {}) => dispatch({ type: 'FailureAnalysis/get/reasons', data }),
  }
}

function mapState2Props(state) {
  let {
    FailureAnalysis: { pagination, display, dataType, showLastYear },
  } = state
  return { pagination, display, dataType, showLastYear }
}

@connect(
  mapState2Props,
  mapDispatch2Props
)
export class App extends Component<void, Props, void> {
  static getPlaceholder = memoize(count => range(count).map(() => Placeholder))
  state = {
    tooltipX: -861112,
    tooltipY: -861112,
    leftItems: [],
    leftClockwise: false,
    centerItems: [],
    rightItems: [],
    rightClockwise: true,
    lastYear: {
      leftItems: [],
      rightItems: [],
    },
    selectedDevice: {
      show: false,
      name: '',
      current: {},
      lastYear: {},
    },
  }

  showTooltip = evt => {
    let { t, dataType } = this.props
    if (evt.type === 'mouseleave') {
      this.setState({ tooltipX: -861112, tooltipY: -861112 })
    } else {
      let stripData = evt.stripData
      let tooltip = stripData.type === 'placeholder' ? null : getLabel(stripData, dataType)
      this.setState({ tooltipX: evt.clientX, tooltipY: evt.clientY, tooltip: tooltip })
    }
    function getLabel(strip, type) {
      let name = strip.data.name || strip.data.key.name
      let unit = t('incident_count_unit')
      if (strip.data.count) {
        return name + ' ' + strip.data.count + unit
      }
      if (strip.data.val) {
        let val = strip.data.val[DataTypeMapping[type]]
        return name + ' ' + (type === 'incident_count' ? val + unit : ToPrecentage(val))
      }
      return 'N.A.'
    }
  }

  isSameDevice = evt => {
    // id is not a uuid, so also compare name
    let { id, name } = evt.strips[0].data.key
    let { id: selectedId, name: selectedName } = this.state.selectedDevice
    return id === selectedId && name === selectedName
  }

  clickLeftTooth = evt => {
    // 1, central chart: fetch reasons
    let param = {}
    let isFocused = this.refs.leftChart.isFocused()
    if (!isFocused || !this.isSameDevice(evt)) {
      let { display } = this.props
      let key = evt.stripData.data.key
      if (display === 'display_asset_type') {
        param.type = key.id
      } else if (display === 'display_brand') {
        param.supplier = key.id
      } else if (display === 'display_dept') {
        param.dept = key.id
      }
    }
    this.props.fetchReasons(param)
    // 2 refresh lengend table
    if (isFocused && this.isSameDevice(evt)) {
      this.hideDevice()
    } else {
      this.showDevice(evt.strips)
    }
    // 3 refesh right chart
    this.props.fetchBriefs('right', 0, param)
    this.clearFocus('right')
  }

  clickRightTooth = evt => {
    let isFocused = this.refs.rightChart.isFocused()
    if (isFocused && this.isSameDevice(evt)) {
      this.hideDevice()
    } else {
      this.showDevice(evt.strips)
    }
    this.props.fetchReasons({ asset: evt.stripData.data.key.id })
    this.clearFocus('left')
  }

  showDevice(strips) {
    let [current] = strips
    let lastYear = strips.lastYear
    const device = {
      show: true,
      name: current.data.key.name,
      id: current.data.key.id,
      current: {
        operation_rate: ToPrecentage(current.data.val.avail),
        ftfr: ToPrecentage(current.data.val.ftfr),
        incident_count: current.data.val.fix,
      },
      lastYear: {
        operation_rate: lastYear ? ToPrecentage(lastYear.data.val.avail) : '-',
        ftfr: lastYear ? ToPrecentage(lastYear.data.val.ftfr) : '-',
        incident_count: lastYear ? lastYear.data.val.fix : '-',
      },
    }
    this.setState({ selectedDevice: device })
  }

  hideDevice() {
    let { selectedDevice } = this.state
    selectedDevice.show = false
    this.setState({ selectedDevice: selectedDevice })
  }

  getCurrentPageLeft() {
    let page = this.props.pagination.left
    return getCurrentPage(page.skip, page.top)
  }

  getCurrentPageRight() {
    let page = this.props.pagination.right
    return getCurrentPage(page.skip, page.top)
  }

  onRightPagerChange = next => {
    let current = this.getCurrentPageRight()
    this.setState({ rightClockwise: current < next })
    this.props.fetchBriefs('right', next)
  }

  onLeftPagerChange = next => {
    let current = this.getCurrentPageLeft()
    this.setState({ leftClockwise: current > next })
    this.props.fetchBriefs('left', next)
  }

  getDisplayOptions() {
    return DisplayOptions.map(o => ({ key: o.key, label: this.props.t(o.key) }))
  }

  mountBriefData = evt => {
    let { t } = this.props
    let [current, lastYear] = evt.target
    if (current.length === 0) {
      let target = t(current.type === 'left' ? 'group_info' : 'asset_info')
      message.info(target + ': ' + t('no_more_data'))
    }
    if (current.type === 'left') {
      this.setState({
        leftItems: current,
        lastYear: { leftItems: lastYear, rightItems: this.state.lastYear.rightItems },
      })
      this.hideDevice() // everytime leftside got refreshed, selected device should be cleared
    } else if (current.type === 'right') {
      this.setState({
        rightItems: current,
        lastYear: { rightItems: lastYear, leftItems: this.state.lastYear.leftItems },
      })
    }
    this.clearFocus(current.type)
  }

  mountReason = evt => {
    let { t } = this.props
    let reasons = evt.target
    if (reasons.length === 0) {
      message.info(t('failure_cause') + ': ' + t('no_more_data'))
    }
    this.setState({ centerItems: reasons })
  }

  clearFocus(type) {
    let chart
    if (type === 'left') {
      chart = this.refs.leftChart
    } else if (type === 'right') {
      chart = this.refs.rightChart
    }
    chart && chart.clearFocus()
  }

  constructor(props) {
    super(props)
    EventBus.addEventListener('failure-analysis-brief-data', this.mountBriefData)
    EventBus.addEventListener('failure-analysis-reason-data', this.mountReason)
  }

  componentWillMount() {
    this.props.init()
  }

  componentWillUnmount() {
    EventBus.removeEventListener('failure-analysis-brief-data', this.mountBriefData)
    EventBus.removeEventListener('failure-analysis-reason-data', this.mountReason)
  }

  render() {
    let {
      tooltipX,
      tooltipY,
      tooltip,
      lastYear,
      selectedDevice,
      leftItems,
      centerItems,
      rightItems,
      leftClockwise,
      rightClockwise,
    } = this.state
    let { updateDisplayType, pagination, clientRect, display } = this.props
    let { left, right } = pagination
    let { outer_R, outer_r, inner_R, inner_r } = ensureSize(clientRect.width, clientRect.height)

    return (
      <div id="app-container" className="failure-analysis is-fullwidth">
        <Header />
        <div className="chart-container is-fullwidth">
          <div className="full-chart container">
            <div className="display-select">{selectHelper(display, this.getDisplayOptions(), updateDisplayType)}</div>
            {left.total > left.top && (
              <Pagination
                current={getCurrentPage(left.skip, left.top)}
                pageSize={left.top}
                total={left.total}
                className="pager-left"
                onChange={this.onLeftPagerChange}
              />
            )}
            {right.total > right.top && (
              <Pagination
                current={getCurrentPage(right.skip, right.top)}
                pageSize={right.top}
                total={right.total}
                className="pager-right"
                onChange={this.onRightPagerChange}
              />
            )}
            <GearListChart
              id="left-chart"
              ref="leftChart"
              startAngle={110}
              endAngle={250}
              outerRadius={outer_R}
              innerRadius={outer_r}
              margin={7}
              onClick={this.clickLeftTooth}
              onMouseMove={this.showTooltip}
              onMouseLeave={this.showTooltip}
              clockwise={false}
              clockwiseAnimate={leftClockwise}
              items={DataOrPlaceHolder(leftItems, pagination.left.top)}
              extra={renderLastYearData(lastYear.leftItems)}
            />
            <GearListChart
              id="center-chart"
              startAngle={90}
              endAngle={90}
              outerRadius={Math.max(inner_R, 200)}
              innerRadius={Math.max(inner_r, 160)}
              margin={8}
              onMouseMove={this.showTooltip}
              onMouseLeave={this.showTooltip}
              items={DataOrPlaceHolder(centerItems, null, 13)}
            />
            <div id="legend-container">
              <Legend items={Items}>
                <LegendTable
                  items={ParameterTypes}
                  selectedDevice={selectedDevice.show && selectedDevice}
                  checkBoxes={CheckBoxes}
                />
              </Legend>
            </div>
            <GearListChart
              id="right-chart"
              ref="rightChart"
              startAngle={290}
              endAngle={70}
              outerRadius={outer_R}
              innerRadius={outer_r}
              margin={3}
              onClick={this.clickRightTooth}
              onMouseMove={this.showTooltip}
              onMouseLeave={this.showTooltip}
              clockwiseAnimate={rightClockwise}
              items={DataOrPlaceHolder(rightItems, pagination.right.top)}
              extra={renderLastYearData(lastYear.rightItems)}
            />
          </div>
          {tooltip && (
            <Tooltip mouseX={tooltipX} mouseY={tooltipY} offsetY={-13} anchor="hcb">
              <div style={{ color: tooltip && tooltip.color }} className="tooltip-content">
                {tooltip}
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    )
  }
}

function renderLastYearData(lastYear) {
  if (!lastYear || !lastYear.length) {
    return null
  }
  return props => LastYearInidicator(props, lastYear)
}
const LastYearInidicator = (props, lastYear) => {
  let { innerRadius, outerRadius } = props
  let current = props.data
  // create a dict to boost lookup performance. TOOD: do it in converter?
  if (lastYear.dict === undefined) {
    lastYear.dict = {}
    lastYear.forEach(item => (lastYear.dict[item.data.key.id] = item))
  }
  let lastYearItem = lastYear.dict[get(current, 'data.key.id')]
  if (lastYearItem === undefined) {
    return null
  }
  current.strips.lastYear = lastYearItem
  let lastYearItemWeight = (lastYearItem.strips[0].value * current.strips[0].weight) / current.strips[0].value
  let height = (outerRadius - innerRadius) * lastYearItemWeight

  return <LastYearMarker r={props.innerRadius + height} {...props} />
}
export default translate()(withClientRect(App))
