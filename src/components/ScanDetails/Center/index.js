import React from 'react'
import { connect } from 'dva'
import { Motion, spring } from 'react-motion'
import body from '#/assets/body.png'
import styles from './index.scss'

export default
@connect(({ ScanDetails_filters }) => ({ cursor: ScanDetails_filters.cursor}))
class Center extends React.PureComponent {
  render() {
    const { cursor } = this.props
    const config = {
      '1': { // head
        padding: spring(0.15),
        scale: spring(5),
        percentX: spring(0.5),
        percentY: spring(-0.01)
      },
      '2': { // chest
        padding: spring(0.15),
        scale: spring(4),
        percentX: spring(0.5),
        percentY: spring(0.12)
      },
      '3': { // abdomen
        padding: spring(0.15),
        scale: spring(4),
        percentX: spring(0.5),
        percentY: spring(0.3)
      },
      '4': { // limbs
        padding: spring(0.15),
        scale: spring(2.8),
        percentX: spring(1.6),
        percentY: spring(0.35)
      },
      '5': { // others
        padding: spring(0.175),
        scale: spring(1),
        percentX: spring(0.5),
        percentY: spring(0.2)
      }
    }
    return (
      <Motion
        defaultStyle={{
          padding: 0.25,
          scale: 1,
          percentX: 0.5,
          percentY: 0.5
        }}
        style={config[cursor['part'] || 5]}
      >
        {
          style => (
            <div
              className={styles['center']}
              style={{
                padding: `${style.padding * 100}%`,
                backgroundImage: `url(${body})`,
                backgroundSize: `auto ${style.scale * 100}%`,
                backgroundPosition: `${style.percentX * 100}% ${style.percentY * 100}%`
              }}
            />
          )
        }
      </Motion>
    )
  }
}
