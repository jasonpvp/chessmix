module.exports = MoveSelector

function MoveSelector (options) {
  var logger = options.logger
  var moveSelector = this

  Object.assign(this, {
    reset: function () {
      this.bestMove = {}
    },
    log: function (msg) {
      logger.logInfo('MoveSelector: ' + msg)
    }
  })
  this.reset()
}

MoveSelector.prototype.selectBetterMove = function (options) {
  if (this.newMoveBeatsCurrentMove(options)) {
    this.bestMove = options.newMove
    this.log('!!! New best move: ' + options.newMove.simpleMove + ' ' + options.newMove.path)
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

MoveSelector.prototype.newMoveBeatsCurrentMove = function (options) {
  var currentMove = this.bestMove
  var newMove = options.newMove

  if (!currentMove.predictiveEval || newMove.predictiveEval) {
    return true
  }

  var currentEval = currentMove.predictiveEval || currentMove.staticEval || {absScore: Number.NEGATIVE_INFINITY}
  var newEval = newMove.predictiveEval || newMove.staticEval || {absScore: Number.NEGATIVE_INFINITY}
  return newEval.absScore > currentEval.absScore
}
