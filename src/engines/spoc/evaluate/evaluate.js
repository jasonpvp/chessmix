var cardinalScore = require('./cardinal_score').cardinalScore
var asciiBoardToArray = require('../util').asciiBoardToArray

module.exports = function Evaluate (config) {
  return {
    staticEval: function (options) {
      return scoreWithCallback(staticEval, options, config.onStaticEval)
    },
    predictiveEval: function (options) {
      return scoreWithCallback(predictiveEval, options, config.onPredictiveEval)
    }
  }
}

function scoreWithCallback (scoreFunction, options, callback) {
  var evaluation = scoreFunction(options)
  callback(evaluation, options)
  return evaluation
}

function staticEval (options) {
  var board = options.context.board
  var boardArray = asciiBoardToArray(board.ascii())
  var score
  if (board.in_checkmate()) {
    score = 1000 * options.context.turn
  } else {
    score = cardinalScore({boardArray: boardArray})
  }
  var absScore = score * options.context.player
  var path = (options.move ? options.move.path : 'null') + '(' + absScore + ')'
  var eval = {
    score: score,
    absScore: absScore,
    absDelta: absScore - options.context.currentEval.staticEval.absScore,
    path: path
  }
  if (options.move) {
    options.move.staticEval = eval
    options.move.path = path
  }
  return eval
}

function predictiveEval (options) {
  // Sort nextMoves best to worst from the perspective of the player whose turn it was at that level
  if (options.context.turn !== options.context.player) {
    options.nextMoves.sort(sortByScoreDesc)
  } else {
    options.nextMoves.sort(sortByScoreAsc)
  }

  var tweek = 0
  if (options.context.player === 1) {
    tweek = options.nextMoves.reduce(function (sum, move) {
      var eval = (move.predictiveEval || move.staticEval)
      sum += eval.absScore
      return sum
    }, 0) / (options.nextMoves.length || 1) / 100
  }

  var bestNextMove = options.nextMoves[0] || {staticEval: options.move.staticEval, path: options.move.path}
  var bestNextEval = bestNextMove.predictiveEval || bestNextMove.staticEval

  var eval = {
    score: bestNextEval.score,
    absScore: bestNextEval.absScore + tweek,
    path: bestNextEval.path || bestNextMove.path
  }
  if (options.move) {
    options.move.predictiveEval = eval
  }
  return eval
}

function sortByScoreDesc (a, b) {
  var aEval = a.predictiveEval || a.staticEval
  var bEval = b.predictiveEval || b.staticEval
  if (aEval.absScore < bEval.absScore) return 1
  if (aEval.absScore > bEval.absScore) return -1
  return 0
}

function sortByScoreAsc (a, b) {
  var aEval = a.predictiveEval || a.staticEval
  var bEval = b.predictiveEval || b.staticEval
  if (aEval.absScore < bEval.absScore) return -1
  if (aEval.absScore > bEval.absScore) return 1
  return 0
}
