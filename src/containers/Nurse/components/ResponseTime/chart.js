import React from 'react'
import { debounce } from 'lodash-es'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/dataZoom'

export {
  echarts
}

export default class Chart extends React.Component {

  _chart

  _onResize = debounce(() => this._chart && this._chart.resize(), 800)

  _initChart = () => {
    let { id, option, chart } = this.props
    let container = document.getElementById(id)
    if (container === null) {
      return
    }
    if (this._chart === undefined) {
      this._chart = echarts.init(container)
    }
    if (option) {
      this._chart.setOption(option)
    }
  }

  componentDidMount() {
    this._initChart()
    window.addEventListener('resize', this._onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize)
  }

  componentDidUpdate() {
    this._initChart()
  }

  render() {
    this._onResize()
    return <div id={this.props.id} style={{ width: '100%', height: '100%' }} />
  }

}