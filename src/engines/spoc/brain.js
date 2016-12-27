var Chess = require('chess.js')
Chess = Chess.Chess || Chess
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
      var game = findGame(options)
      game.board = applyMoves(options)
      return game
    },
    getNextMove: function (options) {
      var game = options.game
      game.bestNextMove = null
      game.bestPrediction = {
        path: ''
      }
      console.log(options.game.board.ascii())
      console.log('stats: ' + JSON.stringify(game.searchStats))

      return searchMoves(options).then(function () {
        var bestMove = game.bestNextMove || {}
        console.log('make best move: ' + bestMove.simpleMove)
        moveGame({game: game, move: bestMove})
        return {
          move: bestMove,
          prediction: game.bestPrediction,
          searchStats: game.searchStats
        }
      })
    }
  }
}

// TODO: find by game id
function findGame (options) {
  var turn = (options.moves && options.moves[0].length > 0) ? 1 : 0
  return games[Object.keys(games)[turn]] || new Game(options)
}

function Game (options) {
  var game = {
    player: (options.moves && options.moves[0].length > 0) ? -1 : 1,
    board: getBoard(options),
    scoreMoves: scoreMoves,
    search: search,
    scoredMoves: {},
    bestNextMove: null,
    bestPrediction: {
      path: ''
    },
    currentEval: {
      staticEval: {score: 0},
      predictiveEval: {score: 0}
    },
    searchStats: {
      id: Math.floor(Math.random() * 100),
      currentDepth: 0,
      levels: []
    }
  }
  game.evaluate = new Evaluate(evalConfig({game: game})),
  games[game.board.fen()] = game
  console.log('Playing as ' + game.player)
  return game
}

function addStats (type, evaluation, options) {
  var context = options.context
  var game = context.game
  var depth = context.startDepth + context.depth
  if (!game.searchStats.levels[depth]) {
    game.searchStats.levels[depth] = {
      depth: depth,
      counts: {
        static: 0,
        predictive: 0
      },
      hist: {
        static: {},
        predictive: {}
      }
    }
  }
  var stat = game.searchStats.levels[depth]
  stat.counts[type]++
  var bucket = Math.floor(evaluation.score)
  stat.hist[type][bucket] = stat.hist[type][bucket] || 0
  stat.hist[type][bucket]++
}

function evalConfig (options) {
  var lastPath = null

  return {
    onStaticEval: function (evaluation, options) {
      if (isNaN(evaluation.score)) return
      addStats('static', evaluation, options)
      if (options.context.depth > 0) return
      var game = options.context.game

console.log('static eval ' + options.move.simpleMove + ' = ' + evaluation.absScore)
      var newMove = options.move
      if (!game.bestNextMove) {
        newMoveLog(game.bestNextMove, newMove, 'static', evaluation)
        game.bestNextMove = newMove
      } else if (!game.bestNextMove.predictiveEval) {
        if (evaluation.absScore > game.bestNextMove.staticEval.absScore) {
          newMoveLog(game.bestNextMove, newMove, 'static', evaluation)
          game.bestNextMove = newMove
        }
      }
    },
    onPredictiveEval: function (evaluation, options) {
      if (isNaN(evaluation.score)) return
      addStats('predictive', evaluation, options)
      var game = options.context.game
      var newMove = options.move
      var path = options.context.path + options.move.simpleMove + '(' + evaluation.score.toFixed(2) + ')'
      if (!lastPath || path.indexOf(lastPath) === 0) {
        lastPath = path
      }

      if (options.context.depth === 0) {
        if (predictiveBeatsOtherMove(evaluation, game.bestNextMove)) {
          console.log('predicted score ' + options.move.simpleMove + ' = ' + evaluation.absScore + ' at depth ' + options.context.depth)
          newMoveLog(game.bestNextMove, newMove, 'predictive', evaluation)
          game.bestNextMove = newMove
          game.bestPrediction = {
            path: lastPath.split(':').slice(1).join(', ')
          }
        }
        lastPath = null
      }
    }
  }
}

function predictiveBeatsOtherMove (predictiveEval, otherMove) {
  if (!otherMove) return true
  var otherEval = otherMove.predictiveEval || otherMove.staticEval || {}
  var otherScore = (otherEval.absScore !== null) ? otherEval.absScore : Number.NEGATIVE_INFINITY
  return predictiveEval.absScore > otherEval.absScore
}

function newMoveLog (oldMove, newMove, type, evaluation) {
  console.log('!!! ' + newMove.simpleMove + ' ' + type + ' ' + evaluation.absScore + ' beats ' + moveLog(oldMove))
}

function moveLog (move) {
  if (!move) return 'null move'
  return move.simpleMove + '(ss: ' + (move.staticEval || {}).absScore + ', ps: ' + (move.predictiveEval || {}).absScore + ')'
}

function moveGame (options) {
  var game = options.game
  delete games[game.board.fen()]
  game.board.move(options.move.simpleMove, {sloppy: true})
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
  var moves = options.moves || []
  var board = options.board || new Chess()
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
  return board
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
      startDepth: options.moves ? options.moves.length - 1 : 0,
      haltSearch: function () {
        if (((new Date()).getTime() - startTime) > timeLimit) {
          console.log('Search timed out')
          resolve()
          return true
        }
        return false
      },
      onSearchComplete: function () {
        console.log('Search completed')
        resolve()
      }
    }
console.log('prev moves: ' + JSON.stringify(options.moves))
    options.game.searchStats.currentDepth = context.startDepth

    console.log('scoring moves from depth ' + context.startDepth + '...')
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
