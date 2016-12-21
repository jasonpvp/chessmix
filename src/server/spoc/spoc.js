// http://www.ficsgames.org/download.html
var Chess = require('chess.js').Chess
var ChessBrain = require('./chess_brain').ChessBrain

module.exports = {
  Spoc: Spoc
}

function Spoc () {
  var board = new Chess()
  var brain = new ChessBrain()

  return {
    getNextMove: function (options) {
      const move = brain.getBestMove(options)
      return move
    }
  }
}

function applyMoves (board, moves) {
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
}
