import { createReducer, createActions } from '../../../modules/create_reducer'

const defaultState = []

const handlers = {
  createExample: (state, action) => {
    return [
      ...state,
      action.payload
    ]
  }
}

export const example = createReducer(handlers, defaultState)

export const exampleActions = createActions(handlers)
