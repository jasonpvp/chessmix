var reduxActions = require('redux-actions')
var createAction = reduxActions.createAction
var handleActions = reduxActions.handleActions
var constantCase = require('constant-case')
var { camelCase, constantCase } = require('change-case')

module.exports = {
  createReducer: function (reducerFunctions, defaultState) {
    var rekeyedFunctions = Object.keys(reducerFunctions).reduce(function (fns, name) {
      fns[constantCase(name)] = reducerFunctions[name]
      return fns
    }, {})

    return handleActions(rekeyedFunctions, defaultState)
  },

  createActions (reducerFunctions) {
    return Object.keys(reducerFunctions).reduce((actions, name) => {
      const actionName = camelCase(name)
      const actionType = constantCase(name)
      actions[actionName] = createAction(actionType)
      return actions
    }, {})
  }
}
