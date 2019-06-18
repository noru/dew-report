import React from 'react'
import styles from './index.scss'

export default
class Arrow extends React.PureComponent {
  render() {
    const { className, disabled, ...restProps } = this.props
    return (
      <div className={`${styles['arrow']} ${className}`} disabled={disabled} {...restProps}/>
    )
  }
}
