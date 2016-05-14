import { combineReducers } from 'redux'
import { freezeCombineReducers } from '../../modules/deep_freeze_reducers'
import { example } from './example'
export const rootReducer = combineReducers({
  example
})

//TODO: use freezeCombineReducers when in dev mode
