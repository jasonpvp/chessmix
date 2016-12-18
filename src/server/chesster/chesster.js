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
    makeMove: function (moves) {
      const nextMove = brain.getBestMove(board, board.moves({verbose: true}))
      console.log(nextMove.move.piece + nextMove.move.from + nextMove.move.to + ' score: ' + nextMove.score)
      moveCallback(nextMove.move.piece, nextMove.move.from, nextMove.move.to, nextMove.move.promotion)
    },
    getNextMove: function (options) {
      board.load(options.fen || newGame)
      if (options.moves) {
console.log(options.moves)
        for (var i = 0; i < options.moves.length; i++) {
console.log('move ' + options.moves[i])
          board.move(options.moves[i], {sloppy: true})
        }
      }
console.log(board.ascii())

      var brain = (board.turn() === 'b') ? blackBrain : whiteBrain
      const move = brain.getBestMove(board, board.moves({verbose: true}))
      console.log(move)
      move.options = options
      return move
    }
  }
}

