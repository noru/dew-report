/* @flow */
import React from 'react'
import styles from './styles.scss'

// for svg sprites
const _require = require.context('#/assets/icons', false, /\.svg$/)

_require.keys().forEach(key => _require(key))

const iconList = _require.keys().reduce((prev, cur) => {
  const iconModule = _require(cur).default
  prev[iconModule.split('#')[1]] = iconModule
  return prev
}, {})

console.log(iconList)

type PropT = {
  symbolId: string
}

export default class PinenutIcon extends React.PureComponent<*, PropT, *> {
  render() {
    const { symbolId, ...restProps } = this.props
    const icon = iconList[symbolId]
    if (!icon) return null
    return (
      <span {...restProps}>
        <svg className={styles.icon}>
          <use xlinkHref={icon} />
        </svg>
      </span>
    )
  }
}
