"use strict";

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
// store must be imported before AppContainer for app actions to wire up correctly
import { store } from './state/store'
import { AppContainer } from './components/App'

var rootNode = document.getElementById('appRoot')

ReactDOM.render((
  <Provider store={store}>
    <AppContainer />
  </Provider>
), rootNode)
