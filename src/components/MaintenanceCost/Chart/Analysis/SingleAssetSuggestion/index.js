import React from 'react'
import { connect } from 'dva'


class SingleAssetSuggestion extends React.PureComponent {
  render() {
    const { overview, thresholds, filters } = this.props
    const { data } = overview
    if (filters.cursor.length !== 2) return null
    const meetedConditions = []
    const keys = filters.target === 'acyman' ? ['labor', 'parts'] : ['repair', 'PM']
    const sum = keys.reduce((prev, cur) => prev + data[cur], 0)
    if (data.onrate < thresholds[0][0]) {
      meetedConditions.push(0)
    }
    if (sum > thresholds[1][0] * data.price) {
      meetedConditions.push(1)
    }
    if (data.onrate > thresholds[2][0] && data.onrate < thresholds[2][1] && sum / data.price > thresholds[2][2] - thresholds[2][3] && sum / data.price < thresholds[2][2] + thresholds[2][3]) {
      meetedConditions.push(2)
    }
    return (
      <div>
        <div className="lead m-b-1">建议</div>
        {meetedConditions.map((condition) => <div key={condition}>建议购买MSA, 符合条件{condition + 1}</div>)}
      </div>
    )
  }
}
export default connect(({MaintenanceCost_overview, thresholds, MaintenanceCost_filters}) => ({overview: MaintenanceCost_overview, thresholds, filters: MaintenanceCost_filters}))(SingleAssetSuggestion)
