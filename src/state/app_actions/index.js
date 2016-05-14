import { exampleActions } from '../reducers/example'

const actionCreators = {
  exampleActions
}

export function actions (dispatch) {
  return Object.keys(actionCreators).reduce((result, namespace) => {
    if (!actionCreators[namespace]) throw (new Error(`${namespace} actions undefined`))

    result[namespace] = Object.keys(actionCreators[namespace]).reduce((actions, name) => {

      actions[name] = () => {
        dispatch(actionCreators[namespace][name].apply(null, arguments))
      }

      return actions
    }, {})

    return result
  }, {})
}
