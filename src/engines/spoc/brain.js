var Chess = require('chess.js').Chess
var Promise = require('bluebird')
var scoreMoves = require('./score_moves').scoreMoves
var Evaluate = require('./evaluate')
var search = require('./search')
var games = {}

Promise.onPossiblyUnhandledRejection(function(error) {
  throw error
})

module.exports = function () {
  return {
    getGame: function (options) {
      return findGame(options)
    },
    getNextMove: function (options) {
      var game = options.game

      return searchMoves(options).then(function () {
        moveGame({game: game, move: game.bestNextMove})
        return game.bestNextMove
      })
    }
  }
}

function findGame (options) {
  var fen = getFen(options)
  return games[fen] || new Game(options)
}

function Game (options) {
  var game = {
    player: options.player || -1,
    board: getBoard(options),
    scoreMoves: scoreMoves,
    search: search,
    bestNextMove: null,
    currentEval: {
      staticEval: {score: 0},
      predictiveEval: {score: 0}
    }
  }
  game.evaluate = new Evaluate(evalConfig({game: game})),
  games[game.board.fen()] = game
  return game
}

function evalConfig (options) {
  return {
    onStaticEval: function (evaluation, options) {
      if (options.context.depth > 0) return
console.log('static eval ' + options.move.simpleMove + ' = ' + evaluation.score)
      var game = options.context.game
      var newMove = options.move
      if (!game.bestNextMove) {
        game.bestNextMove = newMove
      } else if (!game.bestNextMove.predictiveEval) {
        if (evaluation.absScore > game.bestNextMove.staticEval.absScore) {
          game.bestNextMove = newMove
        }
      }
    },
    onPredictiveEval: function (evaluation, options) {
      if (options.context.depth > 0) return
console.log('predicted score ' + options.move.simpleMove + ' = ' + score)
      var game = options.context.game
      var newMove = options.move

      if (!game.bestNextMove || !game.bestNextMove.predictiveScore) {
        game.bestNextMove = newMove
      } else {
        if (evaluation.absScore > game.bestNextMove.predictiveEval.absScore) {
          game.bestNextMove = newMove
        }
      }
    }
  }
}

function moveGame (options) {
  var game = options.game
  delete games[game.board.fen()]
  game.board.move(options.move.verboseMove)
  game.currentEval = {
    staticEval: options.move.staticEval,
    predictiveEval: options.move.predictiveEval
  }
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
  return board
}

function applyMoves (options) {
  var board = options.board
  var moves = options.moves
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
}

function searchMoves (options) {
console.log('search moves')
    var game = options.game

  return new Promise(function (resolve, reject) {
    var timeLimit = (options.timeLimit || 5) * 1000
    var startTime = (new Date()).getTime()
    var board = options.game.board
    var context = {
      game: options.game,
      turn: turn({board: options.game.board}),
      maxDepth: 3,
      haltSearch: function () {
        if (((new Date()).getTime() - startTime) > timeLimit) {
          resolve()
          return true
        }
        return false
      }
    }
console.log('scoring moves...')
    // move scoring continues until haltSearch above returns true
    // or until there are no more moves to score
    game.scoreMoves({
      context: context,
      search: game.search,
      evaluate: game.evaluate
    })
  })
}

function turn (options) {
  if (options.board.turn() === 'b') {
    return -1
  } else {
    return 1
  }
}
