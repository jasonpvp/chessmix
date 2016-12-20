// http://www.ficsgames.org/download.html
var Chess = require('chess.js').Chess
var ChessBrain = require('./chess_brain').ChessBrain
var newGame = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

module.exports = {
  Spoc: Spoc
}

function Spoc () {
  var board = new Chess()

  return {
    getNextMove: function (options) {
      board.load(options.fen || newGame)
      if (options.moves) {
        applyMoves(board, options.moves)
      }
      const move = brain.getBestMove(board)
      move.options = options
      return move
    }
  }
}

function applyMoves (board, moves) {
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
}
