module.exports = MoveSelector

function MoveSelector (options) {
  var logger = options.logger
  var moveSelector = this

  Object.assign(this, {
    reset: function () {
      this.bestMove = {}
      this.scoredMoves = {}
    },
    log: function (msg) {
      logger.logInfo('MoveSelector: ' + msg)
    }
  })
  this.reset()
}

MoveSelector.prototype.selectBetterMove = function (options) {
  this.scoredMoves[options.newMove.simpleMove] = options.newMove
  var newBestMove = this.findBestMove()
  if (this.bestMove !== newBestMove) {
    var oldEval = this.bestMove.predictiveEval || this.bestMove.staticEval || {}
    var eval = newBestMove.predictiveEval || newBestMove.staticEval
    this.log('!!! New best move - Score: ' + eval.absScore + ' ' + eval.path + ' better than score: ' + oldEval.absScore + ' ' + oldEval.path)
    this.bestMove = newBestMove
  }
}

MoveSelector.prototype.findBestMove = function () {
  var _this = this
  var sorted = Object.keys(this.scoredMoves).sort(function (move1, move2) {
    var move1Eval = moveEval(_this.scoredMoves[move1])
    var move2Eval = moveEval(_this.scoredMoves[move2])
    if (move1Eval.absScore < move2Eval.absScore) return 1
    if (move1Eval.absScore > move2Eval.absScore) return -1
    return 0
  })
  var newBest = this.scoredMoves[sorted[0]]
  if (moveEval(newBest).absScore > moveEval(this.bestMove).absScore) {
    return newBest
  } else {
    return this.bestMove
  }
}

/*
*   Predictive and static scores should be on the same scale for direct comparison
*   A static score is based only on the present state of the board
*   A predictive score is based on one or more future states weighted by various factors
*   Each should have an absScore value which is signed so better > worse for the player making the move
*
*   Ranking for moves:
*   - Any move is better than no move
*   - Between moves with only static scores, the best static score wins
*   - Between moves with predictive scores, the best predictive score wins
*   - Between a move with only a static score, and a move with a predictive score, the predictive scored move wins
*     This last state should be avoided by statically scoring all moves first, then predictively scoring the best move before all others
*/

function sortByScoreDesc (move1, move2) {
  var move1Eval = moveEval(move1)
  var move2Eval = moveEval(move2)
  if (move1Eval.absScore < move2Eval.absScore) return 1
  if (move1Eval.absScore > move2Eval.absScore) return -1
  return 0
}

function moveEval (move) {
  return move.predictiveEval || move.staticEval || {absScore: Number.NEGATIVE_INFINITY}
}
