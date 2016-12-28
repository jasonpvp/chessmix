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

function staticChange (move, prevMove) {
  return move.staticEval.absScore - prevMove.staticEval.absScore
}

function predictiveEval (options) {
  var absScore = options.nextMoves.reduce(function (score, move) {
    var moveScore = move.predictiveEval || move.staticEval
    var relativeScore = moveScore.absScore / (options.context.depth || 1)
    var ttlChange = 0//moveScore.absScore - options.context.currentEval.absScore
    if (options.context.depth === 3 && ttlChange < 0) {
      moveScore *= 10
    }
    // TODO: generalize the opponent trap aversion
    if (options.context.depth === 3 && move.verboseMove.captured && move.staticEval.absScore > options.context.currentEval.absScore) {
      var move = options.move
      var moves = []
      while (move) {
        moves.unshift(move)
        move = move.prevMove
      }

//      console.log('moves: ' + moves.map(m => m.simpleMove).join('-'))
      var opponentGain = staticChange(moves[1], moves[0]) * -1
      var opponentLoss = staticChange(moves[2], moves[1])
      var trapPayoff = opponentLoss - opponentGain
//      console.log('loss: ' + opponentGain + ' gain: ' + opponentLoss + ' payoff ' + trapPayoff)
      var opponentTrapAversion = 0
      if (opponentGain > 0 && trapPayoff > 0) {
        var opponentTrapAversion = trapPayoff * (1 - options.context.tradeUpOdds)
        var adjustment = opponentTrapAversion
        relativeScore -= adjustment
        console.log(options.context.path)
        console.log('adjust for opponentTrapAversion: ' + adjustment +  ' for oppGain: ' + opponentGain + ' oppLoss: ' + opponentLoss)
      }
    }
    return score + relativeScore
  }, 0) / (options.nextMoves.length || 1)

  return {
    score: absScore * options.context.game.player,
    absScore: absScore
  }
}
