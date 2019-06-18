//@flow
/* eslint camelcase:0 */
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import { range, memoize, isEqual, clamp, last, values } from 'lodash-es'
import { message, InputNumber, Button, Radio, Input } from 'antd'
import moment from 'moment'
import EventBus from 'eventbusjs'
import GearListChart from 'react-gear-chart'
import Header from '#/containers/ProcessAnalysis/Header'
import Pagination from '#/components/ProcessAnalysis/Pagination'
import Donut from '#/components/ProcessAnalysis/DonutChart'
import Tooltip from 'dew-tooltip'
import Orbit from '#/components/ProcessAnalysis/OrbitChart'
import ReversedRange from '#/components/ProcessAnalysis/ReversedRange'
import withClientRect from '../../../HOC/withClientRect'
import selectHelper from '#/components/common/SelectHelper'
import cache from '#/utils/cache'
import { CurrentPage, ToPrecentage } from '#/utils/helpers'
import classnames from 'classnames'
import colors from '#/utils/colors'
import { PaBriefConv, DetailConv } from '#/utils/converters'
import { warn } from '#/utils/logger'
import { HumanizeDurationInput, HumanizeDurationLabel as humanize } from '#/utils/helpers'
import './app.scss'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const InputGroup = Input.Group
const Placeholder = { strips: { color: '#F9F9F9', weight: 1, type: 'placeholder' } }
const DisplayOptions = [
  { key: 'display_asset_type' },
  // { key: 'display_brand' }, // hide "品牌" as requested
  { key: 'display_dept' },
]
const BallsStub = [
  { key: 'reportTime', i18n: 'report_incident' },
  { key: 'dispatchTime', i18n: 'dispatch_incident' },
  { key: 'respond', i18n: 'accept_incident' },
  { key: 'workingTime', i18n: 'fixing_incident' },
  { key: 'ack', i18n: 'acknowlege_incident' },
  { key: 'ETTR', i18n: 'close_incident' }
]

function DataOrPlaceHolder(items, placeholderSize) {
  // ignore placeholder and empty data
  if (items && items.length && items[0].strips.type !== 'placeholder') {
    return items
  }
  return App.getPlaceholder(placeholderSize)
}

function GetDonutChartRow(label, value) {
  value = value ? moment.duration(value * 1000).humanize() : ''
  return { label, value }
}

const TWO_DAY = 48 * 3600
function HumanizeDurationLabel(value) {
  let units = value > TWO_DAY ? ['d', 'h'] : ['h', 'm']
  return humanize(value, units, true)
}

function GetDistance(ball, gross) {
  // start/end angle are fixed
  if (gross == undefined || gross.ETTR == undefined || ball.key === 'reportTime') {
    return 0
  }
  if (ball.key === 'ETTR') {
    return 300
  }
  let max = gross.ETTR
  let current = gross[ball.key] || 0
  return (current / max) * 300
}

function ensureSize(width, height) {
  width = clamp(width, 1000, 1500)
  if (height < 900) {
    width = 1100
  }
  return {
    outer_R: width * .275,
    outer_r: width * .2,
    inner_R: width * .145,
  }
}

function mapDispatch2Porps(dispatch) {
  return {
    init: () => dispatch({ type: 'ProcessAnalysis/get/all' }),
    updateDisplayType: (value) => dispatch({
      type: 'ProcessAnalysis/update/display',
      data: value.key,
    }),
    updateDataType: (value) => dispatch({
      type:'ProcessAnalysis/update/datatype',
      data: value,
    }),
    updatePagination: (type, pageNumber) => {
      dispatch({
        type: 'ProcessAnalysis/page/change',
        data: { type, value: pageNumber }
      })
    },
    updateDistribution: (value, dataType) => {
      let suffix = dataType === 'ettr' ? 'Ettr' : 'Response'
      dispatch({
        type: 'ProcessAnalysis/update/distribution' + suffix,
        data: value
      })
    },
    fetchBriefs: extraParam => {
      dispatch({ type: 'ProcessAnalysis/get/briefs', data: extraParam })
    },
    fetchDetails: extraParam => {
      dispatch({ type: 'ProcessAnalysis/get/details', data: extraParam })
    },
    fetchGross: extraParam => {
      dispatch({ type: 'ProcessAnalysis/get/gross', data: extraParam })
    },
    fetchPhase: phase => {
      dispatch({ type: 'ProcessAnalysis/get/phase', data: phase })
    },
  }
}

function mapState2Props(state) {
  let { ProcessAnalysis : { pagination, display, dataType, distributionEttr, distributionResponse } } = state
  return { pagination, display, dataType, distributionEttr, distributionResponse }
}

@connect(mapState2Props, mapDispatch2Porps)
export class App extends Component<void, Props, void> {

  static getPlaceholder = memoize(count => range(count)
                           .map(() => Placeholder))
  state = {
    briefs: [],
    leftClockwise: false,
    centerItems: [],
    details: [],
    rightClockwise: true,
    generalGross: {},
    selected: null,
    distriMax: 0,
    distriUnit: 'min',
    distriEttr: [],
    distriResponse: [],
    tooltipX: -861112,
    tooltipY: -861112,
    tooltipData: []
  }

  clickLeftTooth = (evt) => {
    let data = evt.stripData.data
    if (this.refs.leftChart.isFocused() && this.state.selected.id === data.id ) {
      this.setState({ selected: null })
    } else {
      this.setState({ selected: data })
      this.clearFocus('right')
    }
  }

  clickRightTooth = (evt) => {
    let data = evt.stripData.data
    if (this.refs.rightChart.isFocused() && this.state.selected.id === data.id) {
      this.setState({ selected: null })
    } else {
      let data = evt.stripData.data
      this.setState({ selected: data})
      this.clearFocus('left')
    }
  }

  getCurrentPageLeft() {
    let pag = this.props.pagination.left
    return CurrentPage(pag.skip, pag.top)
  }
  getCurrentPageRight() {
    let pag = this.props.pagination.right
    return CurrentPage(pag.skip, pag.top)
  }

  onLeftPagerChange = next => {
    let current = this.getCurrentPageLeft()
    this.setState({ leftClockwise: current < next })
    this.props.updatePagination('brief', next)
  }
  onRightPagerChange = next => {
    let current = this.getCurrentPageRight()
    this.setState({ rightClockwise: current < next })
    this.props.updatePagination('detail', next)
  }
  initDistributionMax(dataType) {
    let [ max, unit ] = HumanizeDurationInput(last(this.getCurrentDistribution(dataType)))
    this.setState({
      distriMax: max,
      distriUnit: unit
    })
  }
  onClickDonut = (evt) => {
    let id = evt.currentTarget.id
    let { dataType } = this.props
    if (id !== dataType) {
      this.props.updateDataType(id)
      this.initDistributionMax(id)
    }
  }

  getDisplayOptions() {
    return DisplayOptions.map(o => ({ key: o.key, label: this.props.t(o.key)}))
  }

  mountBriefData = (evt, data) => {
    let { t, dataType } = this.props
    let briefs = data.data || []
    if (briefs.length === 0) {
      message.info(t('group_info') + ': ' + t('no_more_data'))
    }
    this.setState({ briefs: PaBriefConv(briefs, dataType), selected: null })
    this.clearFocus('left')
  }

  mountDetailData = (evt, data) => {
    let { t, dataType } = this.props
    let details = data.data || []
    if (details.length === 0) {
      message.info(t('asset_info') + ': ' + t('no_more_data'))
    }
    this.setState({ details: DetailConv(details, dataType), selected: null })
    this.clearFocus('right')
  }

  mountGrossData = (evt, data) => {
    let gross = data.data.data // -.-;
    this.setState({ generalGross: gross })
  }

  mountPhaseData = (evt, phaseData) => {
    let phases = values(phaseData.data).sort((a, b) => a - b)
    let timeNodes = phaseData.nodes
    let distri = phases.map((val, i) => {
      if (i > 0) {
        val = val - phases[i - 1]
      }
      let range = timeNodes.slice(i, i + 2)
      return { value: val, key: i, range: range }
    })
    distri.sum = last(phases) // max
    if (phaseData.phase === 'ETTR') {
      this.setState({ distriEttr: distri })
    } else { // respond
      this.setState({ distriResponse: distri })
    }
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

  getLaneColor() {
    let dataType = this.props.dataType
    switch (dataType) {
      case 'ettr':
        return colors.purple
      case 'response_time':
        return colors.yellow
      default:
        throw Error(`Invalid dataType: ${dataType}, no base color found`)
    }
  }

  getBalls() {
    let { t } = this.props
    let { selected, generalGross } = this.state
    // update label
    let gross = selected || generalGross
    let isEmpty = gross.ETTR == 0
    let balls = BallsStub.map((b, i) => Object.assign({
      label: t(b.i18n),
      distance: isEmpty ? i * 60 : GetDistance(b, gross)
    }, b))
    // update lane color
    let dataType = this.props.dataType
    let connectIndex = -1
    switch (dataType) {
      case 'ettr':
        connectIndex = 5
        break
      case 'response_time':
        connectIndex = 2
        break
      default:
        warn('Invalid type')
    }
    balls[connectIndex] && (balls[connectIndex].connectPrevious = true)
    return balls
  }

  onSliderChange = value => {
    let { dataType, updateDistribution } = this.props

    let distribution = this.getCurrentDistribution()
    if (!isEqual(value, distribution)) {
      updateDistribution(value, dataType)
    }
  }

  getMaxInSec() {
    let { distriMax, distriUnit } = this.state
    let factor = 60 // min
    if (distriUnit === 'hour') {
      factor = 3600
    } else if (distriUnit === 'day') {
      factor = 3600 * 24
    }
    return distriMax * factor
  }

  updateDistributionMax = () => {
    let { dataType, updateDistribution } = this.props
    let distribution = this.getCurrentDistribution()
    let step = this.getMaxInSec() / (distribution.length - 1)
    updateDistribution(distribution.map((v, i) => i * step), dataType)
  }

  getCurrentDistribution(type) {
    let { dataType, distributionEttr, distributionResponse } = this.props
    type = type || dataType
    let distribution
    if (type === 'ettr') {
      distribution = distributionEttr
    } else { // response_time
      distribution = distributionResponse
    }
    return distribution
  }

  onDonutHover = (evt, data) => {
    if (evt.type === 'mouseleave') {
      this.setState({ tooltipX: -861112, tooltipY: -861112 })
    } else {
      this.setState({ tooltipX: evt.clientX, tooltipY: evt.clientY, tooltipData: data })
    }
  }

  onToothHover = (evt) => {
    if (evt.type === 'mouseleave') {
      this.setState({ tooltipX: -861112, tooltipY: -861112 })
    } else {
      let name = evt.stripData.data.name
      this.setState({ tooltipX: evt.clientX, tooltipY: evt.clientY, tooltipData: name })
    }
  }

  constructor(props) {
    super(props)
    EventBus.addEventListener('process-analysis-brief-data', this.mountBriefData )
    EventBus.addEventListener('process-analysis-detail-data', this.mountDetailData )
    EventBus.addEventListener('process-analysis-gross-data', this.mountGrossData )
    EventBus.addEventListener('process-analysis-phase-data', this.mountPhaseData )
  }
  componentWillMount() {
    this.initDistributionMax()
    this.props.init()
  }

  componentWillUnmount() {
    EventBus.removeEventListener('process-analysis-brief-data', this.mountBriefData )
    EventBus.removeEventListener('process-analysis-detail-data', this.mountDetailData )
    EventBus.removeEventListener('process-analysis-gross-data', this.mountGrossData )
    EventBus.removeEventListener('process-analysis-phase-data', this.mountPhaseData )
  }

  componentWillReceiveProps(nextProps) {
    let { dataType, distributionEttr, distributionResponse } = nextProps
    let distribution
    if (dataType === 'ettr') {
      distribution = distributionEttr
    } else { // response_time
      distribution = distributionResponse
    }
    let max = last(distribution)
    if (max !== this.state.distributionMax) {
      this.setState({ distributionMax: max})
    }
  }

  render() {
    let { briefs, details, selected, generalGross, distriMax, distriUnit, leftClockwise, rightClockwise,
      distriEttr, distriResponse, tooltipX, tooltipY, tooltipData
    } = this.state
    let { t, updateDisplayType, pagination, clientRect, display, dataType,
      distributionEttr, distributionResponse
    } = this.props
    let { left, right } = pagination
    let { outer_R, outer_r, inner_R } = ensureSize(clientRect.width, clientRect.height)
    let onClickDonut = this.onClickDonut
    let gross = selected || generalGross
    return (
      <div id="app-container" className="process-analysis is-fullwidth">
        <Header/>
        <div className="chart-container is-fullwidth">
          <div className="full-chart container">

            <div className="display-select">{selectHelper(display, this.getDisplayOptions(), updateDisplayType)}</div>
            { left.total > left.top &&
              <Pagination current={CurrentPage(left.skip, left.top)} pageSize={left.top} total={left.total}
                className="pager-left" onChange={this.onLeftPagerChange}/>
            }
            { right.total > right.top &&
              <Pagination current={CurrentPage(right.skip, right.top)} pageSize={right.top} total={right.total}
                className="pager-right" onChange={this.onRightPagerChange}/>
            }
            <GearListChart
              id="left-chart"
              ref="leftChart"
              startAngle={110} endAngle={250}
              outerRadius={outer_R} innerRadius={outer_r}
              margin={7}
              onClick={this.clickLeftTooth}
              onMouseMove={this.onToothHover}
              onMouseLeave={this.onToothHover}
              clockwise={false}
              clockwiseAnimate={leftClockwise}
              items={DataOrPlaceHolder(briefs, pagination.left.top)}
              />
            <Orbit
              id="center-chart"
              radius={Math.max(inner_R, 165)}
              ballRadius={30}
              laneColor={this.getLaneColor()}
              balls={this.getBalls()}
            />
            <div id="legend-container">
              <h1 className="center-chart-title" style={{top: -(inner_R * .4 - 18) + '%'}}>{gross.name || t('all_chosen_assets')}</h1>
              <Donut
                id="ettr"
                className={classnames("donut-chart-ettr", dataType === 'ettr' ? 'active' : '' )}
                baseColor={colors.purple}
                onClick={onClickDonut}
                title={t('ettr')}
                data={distriEttr}
                rows={[GetDonutChartRow(t('average'), gross.ETTR), GetDonutChartRow('P75', gross.ETTR75), GetDonutChartRow('P95', gross.ETTR95)]}
                onMouseMove={evt => this.onDonutHover(evt, distriEttr)}
                onMouseLeave={this.onDonutHover}
              />
              <Donut
                id="response_time"
                className={classnames("donut-chart-response", dataType === 'response_time' ? 'active' : '' )}
                baseColor={colors.yellow}
                onClick={onClickDonut}
                title={t('response_time')}
                data={distriResponse}
                rows={[GetDonutChartRow(t('average'), gross.respond)]}
                onMouseMove={evt => this.onDonutHover(evt, distriResponse)}
                onMouseLeave={this.onDonutHover}
              />

            </div>
            <GearListChart
              id="right-chart"
              ref="rightChart"
              startAngle={290} endAngle={70}
              outerRadius={outer_R} innerRadius={outer_r}
              margin={3}
              clockwiseAnimate={rightClockwise}
              onClick={this.clickRightTooth}
              onMouseMove={this.onToothHover}
              onMouseLeave={this.onToothHover}
              items={DataOrPlaceHolder(details, pagination.right.top)} />

            <div className="range-wrapper">
              <ReversedRange
                className={classnames('slider-ettr', dataType === 'ettr' ? '' : 'hidden')}
                value={distributionEttr}
                showTooltip={dataType === 'ettr'}
                unit="d"
                step={.5}
                onChange={this.onSliderChange}
              />
              <ReversedRange
                className={classnames('slider-response_time', dataType === 'response_time' ? '' : 'hidden')}
                value={distributionResponse}
                showTooltip={dataType === 'response_time'}
                unit="h"
                step={.1}
                onChange={this.onSliderChange}
              />
              <InputGroup compact>
                <InputNumber min={0} value={distriMax} size="small" onChange={val => this.setState({ distriMax: val})} />
                <RadioGroup value={distriUnit} size="small" onChange={e => this.setState({ distriUnit: e.target.value})}>
                  <RadioButton value="hour">{t('hour')}</RadioButton>
                  <RadioButton value="day">{t('day')}</RadioButton>
                </RadioGroup>
              </InputGroup>
              <Button type="primary" size="small" onClick={this.updateDistributionMax}>{t('submit')}</Button>
            </div>
          </div>
        </div>
        <Tooltip mouseX={tooltipX} mouseY={tooltipY} anchor="lvc" offsetX={30} >
          <div className="donut-tooltip">
            { typeof tooltipData === 'string' ?
              tooltipData
              :
              tooltipData.map((row, i) => (
              <tr key={String(i)}>
                <td style={{color:row.color}}>◼</td>
                { Number.isFinite(row.range[1]) ?
                  <td>{HumanizeDurationLabel(row.range[0]) + ' - ' + HumanizeDurationLabel(row.range[1])}</td> :
                  <td>{t('above_duration', { node: HumanizeDurationLabel(row.range[0])})}</td>
                }
                <td>{ToPrecentage((row.value || 0)/ (tooltipData.sum || 1))}</td>
                <td>{row.value + t('incident_count_unit')}</td>
              </tr>
            ))}
          </div>
        </Tooltip>
      </div>
    )
  }
}

export default translate()(withClientRect(App))
