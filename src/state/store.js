import deepFreeze from 'deep-freeze-strict'
import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from './reducers'
import { createMiddleware } from 'redux-promises'

const promisesMiddleware = createMiddleware()
export const store = applyMiddleware(promisesMiddleware)(createStore)(rootReducer, deepFreeze({}))
