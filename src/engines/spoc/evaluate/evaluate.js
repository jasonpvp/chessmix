var cardinalScore = require('./cardinal_score').cardinalScore
var asciiBoardToArray = require('../util').asciiBoardToArray

module.exports = function (config) {
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
  var board = options.context.game.board
  var boardArray = asciiBoardToArray(board.ascii())
  var score = cardinalScore({boardArray: boardArray})
  return {
    score: score,
    absScore: score * options.context.game.player
  }
}

function predictiveEval (options) {
  var turn = options.context.turn
  var absScore = options.nextMoves.reduce(function (score, move) {
    var moveScore = move.predictiveEval || move.staticEval
    return score + moveScore.absScore / (options.context.depth || 1)
  }, 0) / (options.nextMoves.length || 1)

  return {
    score: absScore * options.context.game.player,
    absScore: absScore
  }
}


