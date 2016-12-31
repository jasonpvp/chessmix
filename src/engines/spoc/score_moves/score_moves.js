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

  moves.forEach(function (move) {
    if (move.staticEval) return
    board.move(move.simpleMove, {sloppy: true})
    move.staticEval = evaluate.staticEval({context: context, move: move})
    board.undo()
  })

  moves = search.sortMoves({context: context, moves: moves})

  if (context.depth === 0) {
    console.log('top moves: %o', moves.map(m =>  m.simpleMove + ':' + m.staticEval.score).join(', '))
//  } else if (context.depth < 3) {
//    var isNum = parseInt(options.context.player) === options.context.player
//    console.log('Player: ' + isNum + ' ' + options.context.player + ' Score path: ' + options.context.path + ' with ' + moves.length + ' moves')
  }

  if (context.depth > context.maxDepth || !search.scoreNextMoves({context: context, moves: moves})) {
    return moves
  }

  var len = moves.length
  var nextContext = Object.assign({}, context, {
    depth: context.depth + 1,
    turn: context.turn * -1
  })

  for (var i = 0; i < len && !context.haltSearch(); i++) {
    var move = moves[i]
    if (!move) return

    board.move(move.simpleMove, {sloppy: true})
    nextContext.prevMove = move
    nextContext.moves = move.nextMoves
    nextContext.path = context.path + move.simpleMove + '(' + move.staticEval.absScore + '):'

    var nextMoves = scoreMoves({
      context: nextContext,
      evaluate: evaluate,
      search: search
    })

    move.predictiveEval = evaluate.predictiveEval({context: context, move: move, nextMoves: nextMoves})
    move.nextMoves = nextMoves
    board.undo()
  }

  if (context.depth === 0) {
    context.onSearchComplete()
  }
  return moves
}

function getMoves (options) {
  if (options.moves) {
    return options.moves
  }

  return options.board.moves({verbose: true}).map(function (move) {
    var simple = simpleMove(move)
    return {
      verboseMove: move,
      simpleMove: simple,
      staticEval: null,
      predictiveEval: null,
      nextMoves: null,
      prevMove: options.prevMove,
      path: options.path + ':' + simple,
      depth: options.depth
    }
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
