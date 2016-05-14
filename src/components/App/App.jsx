// Monogoto
import React, { PropTypes } from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import suitClassNames from 'suitcss-classnames'
import { connect } from 'react-redux'
import { actions } from '../../state/app_actions'
require('./App.scss')

export class App extends React.Component {
  constructor (props) {
    super(props)
    this.wrappedActions = actions(props.dispatch)
  }

  getChildContext () {
    return {
      actions: this.wrappedActions
    }
  }

  classNames (options) {
    return suitClassNames({
      namespace: 'smap',
      component: 'ApplicationNode',
      ...options
    })
  }

  render () {
    const { example } = this.props

    const appClasses = this.classNames()
    const titleClasses = this.classNames({descendant: 'title'})

    return (
      <div className={appClasses}>
        <div className={titleClasses}>This is your app</div>
      </div>
    )
  }
}

App.childContextTypes = {
  actions: PropTypes.object
}

export const AppContainer = connect(state => state)(App)
