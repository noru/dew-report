import React from 'react'
import ReactDOM from 'react-dom'

export default
ComposedComponent => class withDimensions extends React.Component {
  state = {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
  calcRect = () => {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect()
    this.setState({
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom
    })
  }

  componentDidMount() {
    this.calcRect()
    window.addEventListener('resize', this.calcRect)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calcRect)
  }

  render() {
    return <ComposedComponent {...this.props} clientRect={{...this.state}}/>
  }
}
