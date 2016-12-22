import 'phantomjs-polyfill'
require('es6-shim')
require('array-includes').shim()

const __karmaWebpackManifest__ = []
const testsContext = require.context('.', true, /_spec\.jsx?$/)

function inManifest (path) {
  return __karmaWebpackManifest__.indexOf(path) >= 0
}

let runnable = testsContext.keys().filter(inManifest)

// Run all tests if we didn't find any changes
if (!runnable.length) {
  runnable = testsContext.keys()
}

runnable.forEach(testsContext)
