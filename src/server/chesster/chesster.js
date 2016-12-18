var Chess = require('chess.js').Chess
var ChessBrain = require('./chess_brain').ChessBrain
var newGame = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

module.exports = {
  Chesster: Chesster
}

function Chesster (board, moveCallback) {
  var whiteBrain = new ChessBrain()
  var blackBrain = new ChessBrain()
  var board = new Chess()

  return {
    getNextMove: function (options) {
      board.load(options.fen || newGame)
      if (options.moves) {
        for (var i = 0; i < options.moves.length; i++) {
          board.move(options.moves[i], {sloppy: true})
        }
      }
      var brain = (board.turn() === 'b') ? blackBrain : whiteBrain
      const move = brain.getBestMove(board, board.moves({verbose: true}))
      console.log(move)
      move.options = options
      return move
    }
  }
}

