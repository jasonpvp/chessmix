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
        applyMoves(board, options.moves)
      }
//      var brain = (board.turn() === 'b') ? blackBrain : whiteBrain
      brain = blackBrain
      const move = brain.getBestMove(board)
      move.options = options
      return move
    },
    train: function (options) {
      const board = options.board
      const moves = options.moves
      const score = options.score
      const rate = options.rate
      // train on each move in reverse order
      for (var i = moves.length; i > 0; i--) {
        board.load(board.fen())
        applyMoves(board, moves.slice(0, i))
        blackBrain.train(score)
        score += (0.5 - score) * rate
      }
    }
  }
}

function applyMoves (board, moves) {
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
}
