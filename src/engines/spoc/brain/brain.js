var Chess = require('chess.js')
Chess = Chess.Chess || Chess
var Promise = require('bluebird')
var scoreMoves = require('../score_moves').scoreMoves
var Evaluate = require('../evaluate')
var search = require('../search')
var Stats = require('../stats')
var MoveSelector = require('../move_selector')

var Logger = require('../../../logger')
var logger = new Logger({logLevel: Logger.LOG_LEVEL.info})

Promise.onPossiblyUnhandledRejection(function(error) {
  throw error
})

module.exports = function () {
  var games = {}

  return {
    getGame: function (options) {
      if (!options.player) {
        logger.logError('Player option require')
        return null
      }
      var game = findGame(options)
      game.board = applyMoves(options)
      return game
    },

    getNextMove: function (options) {
      var game = options.game
      if (!game) {
        logger.logError('Game option require')
        return null
      }
      var prevEval = game.currentEval
      game.moveSelector = new MoveSelector({logger: logger})
      game.searchStats.clearPredictions()
      logger.logInfo(options.game.board.ascii())

      return searchMoves(options).then(function () {
        var bestMove = game.moveSelector.bestMove
        logger.logInfo('make best move: ' + bestMove.simpleMove)
        moveGame({game: game, move: bestMove})
        game.prevMove = bestMove

        return {
          gameId: game.gameId,
          move: responseMove(bestMove),
          prediction: game.moveSelector.bestMove.path,
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
    logger.logVerbose('look for game ' + options.gameId + ' for player ' + options.player)
    var game = options.gameId && games[options.gameId]
    if (game) logger.logVerbose('Found in-progress game: ' + options.gameId + ' for player: ' + game.player)
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
      moveSelector: null,
      currentEval: {
        staticEval: {absScore: 0},
        predictiveEval: {absScore: 0}
      },
      searchStats: new Stats()
    }

    game.evaluate = new Evaluate(evalConfig()),
    games[options.gameId] = game
    logger.logInfo('Playing as ' + game.player)
    return game
  }

  function evalConfig () {
    return {
      onStaticEval: function (evaluation, options) {
        if (isNaN(evaluation.score) || !options.move) return
        var game = options.context.game

        game.searchStats.addStaticStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        if (options.context.depth > 0) return

        logger.logVerbose('static eval ' + options.move.simpleMove + ' = ' + evaluation.absScore)

        game.moveSelector.selectBetterMove({newMove: options.move})
      },
      onPredictiveEval: function (evaluation, options) {
        if (isNaN(evaluation.score)) return
        var game = options.context.game

        game.searchStats.addPredictiveStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        if (options.context.depth > 0) return

        logger.logVerbose('predictive eval ' + options.move.simpleMove + ' = ' + evaluation.absScore)

        game.moveSelector.selectBetterMove({newMove: options.move})
      }
    }
  }

  function moveGame (options) {
    var game = options.game
    game.board.move(options.move.simpleMove, {sloppy: true})
    game.currentEval = {
      staticEval: options.move.staticEval,
      predictiveEval: options.move.predictiveEval
    }
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
    logger.logInfo('search moves')
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
          if (outOfTime) {
            logger.logInfo('Search timed out')
            resolve()
            return true
          }
          return false
        },
        onSearchComplete: function () {
          logger.logInfo('Search completed')
          resolve()
        }
      }
      context.currentEval = game.evaluate.staticEval({context: context})

      logger.logInfo('prev moves: ' + JSON.stringify(options.moves))
      options.game.searchStats.setDepth({depth: context.startDepth})

      logger.logInfo('scoring moves from depth ' + context.startDepth + '...')
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


