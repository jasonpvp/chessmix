/*
*
*/

var tactics = {
  safeCapture: require('./safe_capture'),
  sacrifice: require('./sacrifice'),
  trade: require('./trade')
}

module.exports = function analyze (options) {
  var move = options.move
  return analyzeMove(move)
}

function analyzeMove (move0) {
  return move0.nextMoves.reduce(function (move0Analysis, move1) {
    var nextMoves = move1.nextMoves || []

    var move1Analysis = nextMoves.reduce(function (move1Analysis, move2) {
      move1Analysis.allowsCapture = move1Analysis.allowsCapture || (move2.verboseMove.captured !== undefined && move2.verboseMove.from === move0.verboseMove.to)
      var move2Analysis = (move2.nextMoves || []).reduce(function (move2Analysis, move3) {
        return move2Analysis
      }, {})
      move1Analysis.isSacrifice = move2Analysis.isSacrifice

      return move1Analysis
    }, {
      allowsCapture: false, // true if any move2 can capture
      isSacrifice: false, // true if 
    })

    move0Analysis.isFork = move0Analysis.isFork && move1.recursed && move1Analysis.allowsCapture
    return move0Analysis
  }, {
    // true if every move1 allows any move2 a capture
    isFork: move0.recursed && (move0.nextMoves.length > 0)
  })
}
