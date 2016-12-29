var Chess = require('chess.js')
Chess = Chess.Chess || Chess
var Promise = require('bluebird')
var scoreMoves = require('../score_moves').scoreMoves
var Evaluate = require('../evaluate')
var search = require('../search')
var Stats = require('../stats')

Promise.onPossiblyUnhandledRejection(function(error) {
  throw error
})

module.exports = function () {
  var games = {}
  return {
    getGame: function (options) {
      if (!options.player) {
        console.log('Player option require')
        return null
      }
      var game = findGame(options)
      game.board = applyMoves(options)
      return game
    },
    getNextMove: function (options) {
      var game = options.game
      if (!game) {
        console.log('Game option require')
        return null
      }
      var prevEval = game.currentEval
      game.bestNextMove = null
      game.neutralNextMove = null
      game.searchStats.clearPredictions()
      game.bestPrediction = {
        path: ''
      }
      console.log(options.game.board.ascii())

      return searchMoves(options).then(function () {
        var bestMove = game.bestNextMove || {}
        console.log('make best move: ' + bestMove.simpleMove)
        moveGame({game: game, move: bestMove})
        game.prevMove = bestMove

        return {
          gameId: game.gameId,
          move: responseMove(bestMove),
          prediction: game.bestPrediction,
          searchStats: game.searchStats.serialize(),
          prevEval: prevEval,
          currentEval: game.currentEval
        }
      })
    }
  }

  function responseMove (move) {
    // remove references to other moves to avoid circular refs during serialization
    return Object.keys(move).reduce(function (m, key) {
      if (key !== 'prevMove' && key !== 'nextMoves') {
        m[key] = move[key]
      }
      return m
    }, {})
  }

  function findGame (options) {
    console.log('look for game ' + options.gameId + ' for player ' + options.player)
    var game = options.gameId && games[options.gameId]
    if (game) console.log('Found in-progress game: ' + options.gameId + ' for player: ' + game.player)
    return game || new Game(options)
  }

  function Game (options) {
    var game = {
      gameId: options.gameId,
      player: parseInt(options.player, 10),
      board: getBoard(options),
      scoreMoves: scoreMoves,
      search: search,
      scoredMoves: {},
      bestNextMove: null,
      neutralNextMove: null,
      bestPrediction: {
        path: ''
      },
      currentEval: {
        staticEval: {absScore: 0},
        predictiveEval: {absScore: 0}
      },
      searchStats: new Stats()
    }

    game.evaluate = new Evaluate(evalConfig({game: game})),
    games[options.gameId] = game
    console.log('Playing as ' + game.player)
    return game
  }


  function newMoveMoreNeutral (newEval, currentMove, currentEval) {
    if (!currentMove) return true
    var newDiff = Math.abs(currentEval.staticEval.absScore - newEval.absScore)
    var currentDiff = Math.abs(currentEval.staticEval.absScore - currentMove.staticEval.absScore)
    return newDiff < currentDiff
  }

  function evalConfig (options) {
    var lastPath = null

    return {
      onStaticEval: function (evaluation, options) {
        if (isNaN(evaluation.score) || !options.move) return
        var game = options.context.game

        game.searchStats.addStaticStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        if (options.context.depth > 0) return

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

        if (newMoveMoreNeutral(evaluation, game.neutralNextMove, game.currentEval)) {
          console.log(newMove.simpleMove + ' ' + evaluation.absScore + ' is more neutral')
          game.neutralNextMove = newMove
        }
      },
      onPredictiveEval: function (evaluation, options) {
        if (isNaN(evaluation.score)) return
        var game = options.context.game

        game.searchStats.addPredictiveStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        var newMove = options.move
        var path = options.context.path + options.move.simpleMove + '(' + evaluation.score.toFixed(2) + ')'
        if (!lastPath || path.indexOf(lastPath) === 0) {
          lastPath = path
        }

        if (options.context.depth === 0) {
if (newMove.simpleMove === 'f6e4') {
  console.log(lastPath)
  console.log('same: ' + (newMove === game.bestNextMove) + ', diff: ' + evaluation.absScore + ' ' +  game.currentEval.staticEval.absScore)
}
          if (newMove === game.bestNextMove && evaluation.absScore < game.currentEval.staticEval.absScore) {
            game.bestNextMove = game.neutralNextMove
          } else if (predictiveBeatsOtherMove(evaluation, game.bestNextMove)) {
            console.log('predicted score ' + options.move.simpleMove + ' = ' + evaluation.absScore + ' at depth ' + options.context.depth)
            newMoveLog(game.bestNextMove, newMove, 'predictive', evaluation, lastPath)
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
    var otherEval = otherMove.predictiveEval || otherMove.staticEval
    var otherScore = (otherEval.absScore !== null) ? otherEval.absScore : Number.NEGATIVE_INFINITY
    
    return predictiveEval.absScore > otherEval.absScore
  }

  function newMoveLog (oldMove, newMove, type, evaluation, lastPath) {
    console.log(lastPath)
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
      var timeLimit = (options.timeLimit || 30) * 1000
      var startTime = (new Date()).getTime()
      var board = options.game.board

      var context = {
        game: options.game,
        turn: turn({board: options.game.board}),
        maxDepth: 3,
        tradeUpOdds: 0.005,
        startDepth: options.moves ? options.moves.length - 1 : 0,
        haltSearch: function () {
          var outOfTime = ((new Date()).getTime() - startTime) > timeLimit
          var goodEnough = game.searchStats.predictionCount > 3 && predictiveBeatsOtherMove(game.bestNextMove.predictiveEval || {}, game.currentEval)
          if (outOfTime || goodEnough) {
            console.log(outOfTime ? 'Search timed out' : 'Search found good enough move')
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
      context.currentEval = game.evaluate.staticEval({context: context})

      console.log('prev moves: ' + JSON.stringify(options.moves))
      options.game.searchStats.setDepth({depth: context.startDepth})

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
}


