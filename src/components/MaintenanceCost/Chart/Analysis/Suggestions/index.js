import React from 'react'
import { connect } from 'dva'
import { intersectionBy, uniqBy, flatMap } from 'lodash'
import { THRESHOLD_COLORS } from '#/constants'

class Suggestions extends React.PureComponent {
  render() {
    const { suggestions } = this.props
    return (
      <div>
        <div className="lead m-b-1">建议:</div>
        <div>
          不建议购买MSA的设备:{intersectionBy(...suggestions.notMSA.map(({items}) => items), ({id}) => id).length}台
        </div>
        <div>
          建议购买MSA的设备: {uniqBy(flatMap(suggestions.MSA, ({items}) => items), ({id}) => id).length}台
          {suggestions.MSA.map(({count}, index) => (
            <div key={index} style={{color: THRESHOLD_COLORS[index]}}>满足条件{index + 1}的台数: {count}台</div>
          ))}
        </div>
      </div>
    )
  }
}

export default connect(({suggestions}) => ({suggestions}))(Suggestions)
