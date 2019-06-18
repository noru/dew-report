import React, { Component } from 'react'
import { translate } from 'react-i18next'

type LegendItem = {
  color: string,
  key: string
}
type Props = {
  t: any,
  items: List<LegendItem>,
}

let styles = {
  legend: {
    textAlign: 'center'
  }
}

@translate()
export default class Legend extends Component<void, Props, void> {

  render() {
    const { t, items } = this.props
    return (
      <div style={styles.legend}>
        { this.props.children }
        { 
          items.map(_ => 
          <div key={_.key} className="legend-item">
            <span className="legend-symbol" style={{ background: _.color }}></span>
            <span className="legend-label">{t(_.key)}</span>
          </div>) 
        }
      </div>
    )
  }
}
