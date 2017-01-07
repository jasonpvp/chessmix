process.on('message', function (d) {
  process.send('response from child: ' + d)
})
const fork = require('child_process').fork;

module.exports = function (options) {
  var moves = options.context.board.moves({verbose: true})
  moves.forEach(function (move) {
    var child = fork('./src/engines/spoc/score_moves/score_moves.js')
    child.on('message', function (data) {
      child.send(callbacks(data.callback, data.options))
    })
  })

  var completeCount = 0

  var callbacks = {
    haltSearch: options.context.haltSearch,
    onSearchComplete: function () {
      completeCount++
      if (completeCount === moves.length) {
        options.context.onSearchComplete()
      }
    },
    staticEval: function (dataOpts) {
      return options.search.staticEval({move: dataOpts.move, context: options.context})
    },
    predictiveEval: options.search.staticEval
  }
}
