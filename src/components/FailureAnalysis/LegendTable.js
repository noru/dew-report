// @flow
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'

type LegendItem = {
  color: string,
  key: string
}

type Props = {
  t: any,
  items: Array<LegendItem>,
  checkBoxes: Array<LegendItem>,
  selectedDevice: {
    name: string,
    data: any
  }
}

let styles = {
  title: {
    fontSize: '1.2em',
    position: 'relative',
    top: '-1em',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: '.85em',
    position: 'relative',
    top: '-.5em',
  },
  content: {
    textAlign: 'center',
    fontSize: '1.08em',
    width: 'auto',
    display: 'inline-block',
  },
  firstCol: {
    textAlign: 'start',
    cursor: 'pointer',
    opacity: .3,
  },
  centerAlign: {
    textAlign: 'center',
    fontSize: '0.9em',
  },
  active: {
    opacity: 1,
  }
}

function conditionalStyle(b, style) {
  return b ? style : {}
}

function mapState2Props(state) {
  let { dataType, showLastYear } = state.FailureAnalysis
  return { dataType, showLastYear }
}

function mapDispatch2Props(dispatch) {
  return {
    onToggleLastYear: (show) => dispatch({ type: 'FailureAnalysis/update/showlastyear', data: show }),
    onDataTypeChange: (evt) => dispatch({ type: 'FailureAnalysis/update/datatype', data: evt.target.value }),
  }
}

@connect(mapState2Props, mapDispatch2Props)
@translate()
export default class LegendTable extends Component<void, Props, void> {

  _getSymbol(item: LegendItem) {
    let lastYearUnchecked = !this.props.showLastYear && item.key === 'same_period_last_year'
    let style  = lastYearUnchecked ? { border: '2px solid ' + item.color } : { background : item.color }
    return <span style={{...style, ...styles.symbol}} className='legend-symbol'/>
  }

  _getTitle() {
    let title = null
    if (this.props.selectedDevice) {
      title = <tr><th colSpan="3" style={{textAlign: 'center'}}><span style={styles.title}>{this.props.selectedDevice.name}</span></th></tr>
    }
    return title
  }

  render() {
    let { t, items, selectedDevice, checkBoxes, dataType, showLastYear,
      onToggleLastYear, onDataTypeChange } = this.props
    let headers = ['parameters']
    if (selectedDevice) {
      headers.push('chosen_period', 'same_period_last_year')
    }

    return (
      <div style={styles.content}>

        <table>
          <tbody>
            { this._getTitle() }
            <tr>
              { headers.map(key => <td key={key}><span style={styles.subtitle}>{t(key)}</span></td>) }
            </tr>
            {
              items.map(_ =>
              <tr key={_.key}>
                <td>
                  <label htmlFor={_.key} key={_.key} style={{...styles.firstCol, ...conditionalStyle(_.key === dataType, styles.active)}}>
                    <input id={_.key} type="radio" name="para-type" value={_.key}
                      checked={_.key === dataType}
                      onChange={onDataTypeChange} style={{display:'none'}}/>
                    { this._getSymbol(_) }
                    <span>{t(_.key)}</span>
                  </label>
                </td>

              { selectedDevice &&
                [ <td key="current" style={styles.centerAlign}><span>{selectedDevice.current[_.key]}</span></td>,
                  <td key="lastYear" style={styles.centerAlign}><span>{selectedDevice.lastYear[_.key]}</span></td> ]
              }
              </tr>)
            }
            {
              checkBoxes.map(_ =>
              <tr key={_.key}>
                <td>
                  <label htmlFor={_.key} key={_.key} style={{...styles.firstCol, ...conditionalStyle(showLastYear, styles.active)}}>
                    <input id={_.key} name={_.key} type="checkbox"
                      checked={showLastYear}
                      onChange={() => onToggleLastYear(!showLastYear)} style={{display:'none'}}/>
                    { this._getSymbol(_) }
                    <span>{t(_.key)}</span>
                  </label>
                </td>
              </tr>
              )
            }
          </tbody>
        </table>

      </div>
    )
  }
}
