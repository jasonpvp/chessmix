/*
*   scoreMoves is responsible for exploring and scoring possible moves
*   It is stateless, but updates state on the collection of moves passed to it
*   This function takes three general sets of options:
*     - context:  the general context of the search, player, turn and current depth of the search
*     - evaluate:    functions for evaluating a given board and series of moves that could follow that board
*     - search:   the strategy for searching moves
*
*   Options:
*     context:
*       board: a chess.js board,
*       player: -1 | 1
*       turn: -1 | 1
*       moves: options argument to provide previously-searched moves. When not provided, moves are obtained from the board.
*       prevMove: the move the preceded the current board state
*       haltSearch: called before each search recursion if search should be aborted. Current best move is passed to this function
*       onSearchCOmplete: called when all possible moves withing given parameters have been searched
*       depth: current level of recursion in the move search
*       turn: the player moving at the current depth: 1 for white, -1 for black
*     evaluate:
*       staticEval: evaluates a board at a given state with respect to the current context
*       predictiveEval: evaluates a move with respect to all subsequent moves explored and with respect to the current context
*     search:
*       scoreNextMoves: based on context and moves, return a boolean of whether to score nextMoves
*       sortMoves: provided the current context, a list of moves and the score object, returns moves sorted in order to search
*/

var analyze = require('../tactics/analyze')
var Tactics = require('../tactics')
var ffi = require('ffi')
var ref = require('ref')
var path = require('path')

var crusty = ffi.Library(path.join(__dirname, '../../../../crusty/target/release/libcrusty'), {
  score_moves: ['int32', ['string', 'pointer']]
})

var callback = ffi.Callback('void', ['string'], function (scoredMoveJson) {
  var scoredMove = JSON.parse(scoredMoveJson)
  console.log('Scored move: ' + JSON.stringify(scoredMove))
})

// starting board
// var fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
// test checkmate
// var fen = 'rnbqkbnr/1ppppppp/8/8/p1B5/4PQ2/PPPP1PPP/RNB1K1NR w KQkq - 0 1'
// avoid bad trade
// var fen = 'rn1qkbnr/ppp1ppp1/3p4/7p/6b1/P1P1P3/1P1P1PPP/RNBQKBNR w KQkq - 0 1'
// opponent challenges pieces
// var fen = 'rn1qkbnr/ppp1ppp1/B2p4/7p/6b1/P1P1P3/1P1P1PPP/RNBQK1NR w KQkq - 0 1'
// opponent takes piece
//var fen = 'rnbqkbnr/ppp1pppp/8/3p4/2N1N3/8/PPPPPPPP/R1BQKB1R w KQkq - 0 1'
// sacrifice queen for checkmate in 2
//var fen = 'rnbqkb1r/pppppppp/7n/8/2B1PQ2/5R2/PPPP1PPP/RNB1K1N1 w KQkq - 0 1'
// avoid bad capture (requires check awareness and 4-move look ahead)
//var fen = 'rnbqk1nr/pppp1pp1/4pb2/7p/8/1PNPP3/P1P2PPP/R1BQKBNR w KQkq - 0 1'
// avoid bad capture (requires only 2 move look ahead
var fen = 'rnbqkbr1/1pppppp1/p6n/5B1p/8/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1'
var threadId = crusty.score_moves(fen, callback)
console.log('threadId = ' + threadId)

module.exports = function ScoreMoves (options) {
  return scoreMoves(options)
}

// TODO: allow context to include a moveCache
var defaultContext = {
  player: null,
  turn: null,
  board: null,
  moves: null,
  prevMove: null,
  haltSearch: null,
  onSearchComplete: null,
  maxDepth: 200,
  depth: 0,
  path: ''
}

function scoreMoves (options) {
  var context = Object.assign({}, defaultContext, options.context)

  var board = context.board
  var evaluate = options.evaluate
  var search = options.search
  var moves = getMoves(context)
  var goodMoves = moves

  moves.forEach(function (move) {
    if (move.staticEval) return
    board.move(move.simpleMove, {sloppy: true})
    move.staticEval = evaluate.staticEval({context: context, move: move})
    board.undo()
  })

  if (context.depth > context.maxDepth || !search.scoreNextMoves({context: context, moves: moves})) {
    return moves
  }

  // TODO: move the block below into the scoreNextMoves function
  if (options.context.depth > 1 && options.context.turn === options.context.player) {
    var worst = {staticEval: {absDelta: 0}}
    goodMoves = moves.filter(function (move) {
      var isGood = isGoodPath({move: move, context: options.context})
      if (!isGood && Math.abs(worst.staticEval.absDelta) < Math.abs(move.staticEval.absDelta)) {
        worst = move
      }
      return isGood
    })
    if (goodMoves.length < moves.length) {
      var who = (options.context.turn === options.context.player) ? 'Player' : 'Opponent'
      console.log(who + ' pruned bad path: ' + worst.path)
      return moves
    }
  }

  var recurseMoves = search.sortMoves({context: context, moves: moves})
  if (options.context.depth === 1 && moves[0]) {
    console.log('Recurse on ' + moves[0].prevMove.simpleMove)
    console.log('Moves: ' + moves.map(function (move) { return move.simpleMove }).join(', '))
  }
  //console.log('Score path: ' + options.context.path + ' with ' + recurseMoves.length + ' moves')

  var len = recurseMoves.length
  var nextContext = Object.assign({}, context, {
    depth: context.depth + 1,
    turn: context.turn * -1
  })

  for (var i = 0; i < len && !context.haltSearch(); i++) {
    var move = recurseMoves[i]
    if (!move) return
    move.recursed = true
    board.move(move.simpleMove, {sloppy: true})
    nextContext.prevMove = move
    nextContext.moves = move.nextMoves
    nextContext.path = move.path

    var nextMoves = scoreMoves({
      context: nextContext,
      evaluate: evaluate,
      search: search
    })

    move.nextMoves = nextMoves || []
    if (context.depth === 0) {
      move.analysis = analyze({move: move})
    }
    move.predictiveEval = evaluate.predictiveEval({context: context, move: move, nextMoves: move.nextMoves})
    if (context.depth === 0) {
      console.log('Predicted score: ' + move.predictiveEval.absScore + ' for: ' + move.predictiveEval.path)
    }

    board.undo()
  }

  if (context.depth === 0) {
    context.onSearchComplete()
  }
  return moves
}

function getMoves (options) {
//  if (options.moves) {
//    return options.moves
//  }

  return options.board.moves({verbose: true}).map(function (move) {
    var simple = move.simpleMove || simpleMove(move)
    var moveObj = {
      verboseMove: move,
      simpleMove: simple,
      path: options.path + ':' + simple,
      depth: options.depth,
      staticEval: null,
      predictiveEval: null,
      analysis:{},
      recursed: false,
      nextMoves: null,
      prevMove: options.prevMove
    }
    moveObj.rootMove = (options.prevMove && options.prevMove.rootMove) || moveObj
    return moveObj
  })
}

function simpleMove (verboseMove) {
  var from = verboseMove.from
  var to = verboseMove.to
  if (to.length === 1) {
    // when move is like 'a45' or 'a4b', make like 'a4a5' or 'a4b4'
    // chess.js has a bug where the short form can break the board state
    if (parseInt(to) > 0) {
      to = from[0] + to
    } else {
      to = to + from[1]
    }
  }
  return from + to + (verboseMove.promotion || '')
}

function isGoodPath (options) {
  // isGoodPath is called for moves that follow the current move in the search
  // The path is bad for the player making this move if any of the following moves
  // reduce their position on the board beyond a certain threshold
  var badness = options.move.staticEval.absDelta * options.context.turn * options.context.player
  return (badness >= options.context.badPathThreshold)
}
