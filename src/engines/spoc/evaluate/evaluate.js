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
  var score = cardinalScore({boardArray: boardArray})
  var absScore = score * options.context.player
  var eval = {
    score: score,
    absScore: absScore,
    absDelta: absScore - options.context.currentEval.staticEval.absScore
  }
  if (options.move) {
    options.move.staticEval = eval
    options.move.path += '(' + eval.absScore + ')'
    if (options.move.rootMove.bestPath.absScore < eval.absScore) {
      options.move.rootMove.bestPath = {
        path: options.move.path,
        absScore: eval.absScore
      }
    }
  }
  return eval
}

function predictiveEval (options) {
  var absScore = options.nextMoves.reduce(function (score, move) {
    var moveScore = move.predictiveEval || move.staticEval
    var relativeScore = moveScore.absScore
    // TODO: use tactics here to determine best options not just average outcomes
    if (options.context.depth === 1 && moveScore.absScore < options.context.currentEval.staticEval.absScore) {
      relativeScore *= options.nextMoves.length
    }
    if (options.context.depth === 2 && moveScore.absScore > move.prevMove.staticEval.absScore) {
      relativeScore *= options.nextMoves.length
    }

    return score + relativeScore
  }, 0) / (options.nextMoves.length || 1)
  if (options.move.analysis.isFork) absScore += 10

  var eval = {
    score: absScore * options.context.player,
    absScore: absScore
  }
  if (options.move) {
    options.move.predictiveEval = eval
    if (options.move.rootMove.bestPath.absScore < eval.absScore) {
      options.move.rootMove.bestPath = {
        path: options.move.path,
        absScore: eval.absScore
      }
    }
  }
  return eval
}
