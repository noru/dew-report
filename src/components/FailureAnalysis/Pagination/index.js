/* @flow */
import React, { PureComponent } from 'react'
import classnames from 'classnames'

import './styles.scss'

type PropsT = {
  current: number,
  pageSize: number,
  total: number
}

export default class Pager extends PureComponent<void, PropsT, void> {
  static defaultProps = {
    current: 1,
    pageSize: 10
  }

  render () {
    const { total, pageSize, current, className } = this.props
    const totalPages = Math.ceil(total / pageSize)

    const prevCls = [current <= 1 ? 'disabled' : '', 'prev'].join(' ')
    const nextCls = [current === totalPages ? 'disabled' : '', 'next'].join(' ')

    return (
      <div className={classnames('pager', className)}>
        <div className="wrapper">
          <div className={prevCls} onClick={this.handlePrev}></div>
          <div className="counter">
            { totalPages > 0 &&
              <span>
                <span>{current}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </span>
            }
          </div>
          <div className={nextCls} onClick={this.handleNext}></div>
        </div>
      </div>
    )
  }

  handlePrev = (e: Event) => {
    e.preventDefault()
    const { current } = this.props
    if (current > 1) this.changePage(current - 1)
  }

  handleNext = (e: Event) => {
    e.preventDefault()
    const { total, pageSize, current } = this.props
    const totalPages = Math.ceil(total / pageSize)
    if (current < totalPages) this.changePage(current + 1)
  }

  changePage = (current: number) => {
    if (current) {
      this.props.onChange && this.props.onChange(current)
    }
  }
}