import React from 'react'
import ReactDOM from 'react-dom'

let tooltipEl

export function showTooltip(e, props, Component) {
  if (tooltipEl) return
  const style = {
    pointerEvents: 'none',
    position: 'fixed',
    minWidth: 100,
    background: '#d8d8d8',
    border: '1px solid #5d87d4',
    borderRadius: 3,
    padding: '12px 7px',
  }
  const clientRect = e.currentTarget.getBoundingClientRect()
  if (clientRect.top > window.innerHeight * 0.6) {
    style.bottom = window.innerHeight - clientRect.bottom + clientRect.height / 2 + 'px'
  } else {
    style.top = clientRect.top + clientRect.height / 2 + 'px'
  }

  if (clientRect.left > window.innerWidth * 0.6) {
    style.right = window.innerWidth - clientRect.right + clientRect.width / 2 + 'px'
  } else {
    style.left = clientRect.left + clientRect.width / 2 + 'px'
  }
  tooltipEl = tooltipEl || ReactDOM.render(
    <div style={style}>
      <Component {...props} />
    </div>,
    document.createElement('div')
  )
  document.body.appendChild(tooltipEl)
}

export function hideTooltip(e, props, item) {
  document.body.removeChild(tooltipEl)
  tooltipEl = undefined
}
