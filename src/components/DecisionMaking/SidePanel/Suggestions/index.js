import React, { PureComponent } from 'react'

import ProgressBar from '#/components/DecisionMaking/ProgressBar'

import { round } from '#/utils'

import styles from './styles.scss'

export default class Suggestions extends PureComponent {
  render () {
    const { data } = this.props
    return (
      <div>
        <div className="lead">建议</div>
        {
          data.suggestions.map((n, i) => {
            return <div key={i}>
              <div>{n.title}</div>
              {
                n.addition
                  ? n.addition.split(',')
                    .filter(n => n)
                    .map((item, index) => <div key={index} className="lead m-l-3">{item.trim()}</div>)
                  : null
              }
            </div>
          })
        }
        {
          (
            data.usage_predict !== data.usage_sug
            || data.usage_predict_increase !== data.usage_sug_increase
          ) && <div>
            <div>采纳建议后的使用率预测</div>
            <ProgressBar
              className={styles['progress']}
              title="采取建议"
              percent={data.usage_sug}
              textDesc={`
                ${round(data.usage_sug * 100, 1)}%
                ${round(data.usage_sug_increase * 100, 1)}%
              `} />
          </div>
        }
      </div>
    )
  }
}
