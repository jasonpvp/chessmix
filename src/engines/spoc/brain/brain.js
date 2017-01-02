var Chess = require('chess.js')
Chess = Chess.Chess || Chess
var Promise = require('bluebird')
var ScoreMoves = require('../score_moves')
var Evaluate = require('../evaluate')
var Search = require('../search')
var Stats = require('../stats')
var MoveSelector = require('../move_selector')
var Logger = require('../../../logger')

Promise.onPossiblyUnhandledRejection(function(error) {
  throw error
})

module.exports = function Brain (options) {
  var state = {
    player: parseInt(options.player, 10),
    board: getBoard(options),
  }

  var logger = new Logger({logLevel: Logger.LOG_LEVEL.info})

  var engine = {
    search: new Search(),
    scoreMoves: ScoreMoves,
    evaluate: new Evaluate(evalConfig()),
    moveSelector: new MoveSelector({logger: logger}),

    prevMove: null,
    currentEval: {
      staticEval: {absScore: 0},
      predictiveEval: {absScore: 0}
    },
    prevEval: null,
    searchStats: new Stats(),
    logger: logger
  }

  return {
    board: state.board,
    getNextMove: function (options) {
      engine.prevEval = engine.currentEval
      engine.moveSelector.reset()
      engine.searchStats.clearPredictions()
console.log('load fen: ' + options.fen)
      state.board.load(options.fen)
      logger.logInfo(state.board.ascii())

      return searchMoves(options).then(function () {
        var bestMove = engine.moveSelector.bestMove
        engine.logger.logInfo('make best move: ' + bestMove.simpleMove)
        moveGame({move: bestMove})
        engine.prevMove = bestMove

        return {
          move: responseMove(bestMove),
          prediction: engine.moveSelector.bestMove.path,
          searchStats: engine.searchStats.serialize(),
          prevEval: engine.prevEval,
          currentEval: engine.currentEval
        }
      })
    }
  }

  function responseMove (move) {
    // remove references to other moves to avoid circular refs during serialization
    return Object.keys(move).reduce(function (m, key) {
      if (key !== 'prevMove' && key !== 'nextMoves' && key !== 'rootMove') {
        m[key] = move[key]
      }
      return m
    }, {})
  }

  function evalConfig () {
    return {
      onStaticEval: function (evaluation, options) {
        if (isNaN(evaluation.score) || !options.move) return

        engine.searchStats.addStaticStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        if (options.context.depth > 0) return

        logger.logVerbose('static eval ' + options.move.simpleMove + ' = ' + evaluation.absScore)

        engine.moveSelector.selectBetterMove({newMove: options.move})
      },
      onPredictiveEval: function (evaluation, options) {
        if (isNaN(evaluation.score)) return

        engine.searchStats.addPredictiveStat({
          depth: options.context.startDepth + options.context.depth,
          score: evaluation.score
        })

        if (options.context.depth > 0) return

        logger.logVerbose('predictive eval ' + options.move.simpleMove + ' = ' + evaluation.absScore)

        engine.moveSelector.selectBetterMove({newMove: options.move})
      }
    }
  }

  function moveGame (options) {
    state.board.move(options.move.simpleMove, {sloppy: true})
    engine.currentEval = {
      staticEval: options.move.staticEval,
      predictiveEval: options.move.predictiveEval
    }
  }

  function getBoard (options) {
    var board = new Chess()
    if (options.fen) {
      board.load(options.fen)
    } else if (options.moves) {
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
    engine.logger.logInfo('search moves')

    return new Promise(function (resolve, reject) {
      var timeLimit = (options.timeLimit || 30) * 1000
      var startTime = (new Date()).getTime()

      var context = {
        board: state.board,
        player: state.player,
        turn: turn({board: state.board}),
        currentEval: engine.currentEval,
        maxDepth: 3,
        badPathThreshold: -1,
        tradeUpOdds: 0.005,
        startDepth: options.moves ? options.moves.length - 1 : 0,
        haltSearch: function () {
          var outOfTime = ((new Date()).getTime() - startTime) > timeLimit
          if (outOfTime) {
            engine.logger.logInfo('Search timed out')
            resolve()
            return true
          }
          return false
        },
        onSearchComplete: function () {
          engine.logger.logInfo('Search completed')
          resolve()
        }
      }
      engine.currentEval = engine.evaluate.staticEval({context: context})

      engine.logger.logInfo('prev moves: ' + JSON.stringify(options.moves))
      engine.searchStats.setDepth({depth: context.startDepth})

      engine.logger.logInfo('scoring moves from depth ' + context.startDepth + '...')
      // move scoring continues until haltSearch above returns true
      // or until there are no more moves to score
      engine.scoreMoves({
        context: context,
        search: engine.search,
        evaluate: engine.evaluate
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
