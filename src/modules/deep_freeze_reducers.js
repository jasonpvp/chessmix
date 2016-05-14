import deepFreeze from 'deep-freeze-strict'

export function freezeCombineReducers (reducers) {
  let reducerKeys = Object.keys(reducers);
  return (inputState = deepFreeze({}), action) => {
    return deepFreeze(reducerKeys.reduce((reducersObject, reducerName) => {
      let reducer = reducers[reducerName];
      let reducerState = inputState[reducerName];
      reducersObject[reducerName] = reducer(reducerState, action);
      return reducersObject;
    }, {}));
  }
}
