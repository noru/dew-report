import React from 'react'
import { Table } from 'antd'
import { flow } from 'noru-utils/lib'
import { translate } from 'react-i18next'
import { connect } from 'dva'
import Chart, { echarts } from './chart'
import './index.scss'

const getOption = (t, data) =>{
  let labels = [], values = []
  data.forEach(d => {
    labels.push(d.assetGroupName)
    values.push(d.avgResponseTime)
  })
  let showDataZoom = data.length > 20
  return {
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false,
          show: showDataZoom,
        },
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      }
    },
    dataZoom: [{
      type: 'slider',
      show: showDataZoom,
    }],
    grid: {
      left: '8%',
      right: '8%',
      bottom: '3%',
      top: '13%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        textStyle: {
          color: '#999',
        },
        rotate: 45,
      },
    },
    yAxis: {
      name: t`分钟`,
      nameGap: 15,
      nameTextStyle: {
        color: '#999',
        padding: [0, 40, 0, 0],
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        textStyle: {
          color: '#999'
        }
      }
    },
    series: [{
      type: 'bar',
      barMaxWidth: 40,
      itemStyle: {
        normal: {
          barBorderRadius: [1000, 1000, 0, 0],
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1, [{
                offset: 0,
                color: '#fab174'
              },
              {
                offset: 0.5,
                color: '#cb79b4'
              },
              {
                offset: 1,
                color: '#b65ecf'
              }
            ]
          )
        },
      },
      data: values,
    }]
  }
}

const NoData = ({ t }) => <div className="no-data-placeholder"><span><i className="anticon anticon-frown-o"></i>{t`暂无数据`}</span></div>

export class AssetOverview extends React.Component {

  render() {
    let { t, avg} = this.props

    return (
      <div className="response-time-chart">

        <h1>{t`平均响应时间`}</h1>

        <div className="chart-content">
          { avg.length > 0
            ? <Chart option={getOption(t, avg)} id="avg-response-time-chart"/>
            : <NoData t={t}/>
          }
        </div>

      </div>
    )
  }

}

function mapState2Props(state) {
  return {
    avg: state.Nurse.avgResponseTime
  }
}

export default flow(
  AssetOverview,
  translate(),
  connect(mapState2Props)
)