var Chess = require('chess.js')
var scoreMoves = require('./score_moves').scoreMoves
var score = require('./score')
var search = require('./search')
var games = {}

module.exports = function () {
  return {
    getGame: function (options) {
      return {
        board: getBoard(options)
      }
    },
    getNextMove: function (options) {
      var game = options.game
      var nextMove = getNextMove(options)
      moveGame({game: game, move: nextMove})
      return nextMove
    }
  }
})

function findGame (options) {
  var fen = getFen(options)
  return games[fen] || new Game(options)
}

function Game (options) {
  var game = {
    player: options.player || -1,
    board: getBoard(options),
    currentScore: 0
  }
  games[game.board.fen()] = game
  return game
}

function moveGame (options) {
  var game = options.game
  delete games[game.board.fen()]
  game.board.move(options.move.verboseMove)
  games[game.board.fen()] = game
}

function getFen(options) {
  if (options.fen && !options.moves) return options.fen
  return getBoard(options).fen()
}

function getBoard (options) {
  var board = new Chess()
  if (options.fen) {
    board.load(options.fen)
  }
  if (options.moves) {
    applyMoves({board: board, moves: options.moves})
  }
  boards[board.fen()] = board
  return board
}

function applyMoves (options) {
  var board = options.board
  var moves = options.moves
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
}

function getNextMove (options) {
  var timeLimit = (options.timeLimit || 5) * 1000
  var startTime = (new Date()).getTime()
  var board = options.game.board
  var context = {
    game: options.game,
    turn: turn(options.board),
    haltSearch: function () {
      return ((new Date()).getTime() - startTime) > timeLimit
    }
  }
}

function turn (options) {
  if (options.board.turn() === 'b') {
    return -1
  } else {
    return 1
  }
}
