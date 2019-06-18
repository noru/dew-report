// @flow
import React from 'react'
import ReactDOM from 'react-dom'

export type State = {
  hovered: boolean
}

export default
(ComposedComponent: *) => class withHover extends React.Component<*, *, State> {
  state = {
    hovered: false
  }

  onMouseEnter = (e:any):any => !this.state.hovered && this.setState({
    hovered: true
  })

  onMouseLeave = (e:any):any => this.setState({
    hovered: false
  })

  componentDidMount() {
    this.el = ReactDOM.findDOMNode(this)
    this.el.addEventListener('mouseenter', this.onMouseEnter)
    this.el.addEventListener('mouseleave', this.onMouseLeave)
  }

  componentWillUnmount() {
    this.el.removeEventListener('mouseenter', this.onMouseEnter)
    this.el.removeEventListener('mouseleave', this.onMouseLeave)
    this.el = null
  }

  render() {
    return <ComposedComponent {...this.props} hovered={this.state.hovered}/>
  }
}
