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
*       game: object for the board, player, current score, etc
*       moves: options argument to provide previously-searched moves. When not provided, moves are obtained from the board.
*       prevMove: the move the preceded the current board state
*       haltSearch: called before each search recursion if search should be aborted. Current best move is passed to this function
*       depth: current level of recursion in the move search
*       turn: the player moving at the current depth: 1 for white, -1 for black
*     evaluate:
*       staticEval: evaluates a board at a given state with respect to the current context
*       predictiveEval: evaluates a move with respect to all subsequent moves explored and with respect to the current context
*     search:
*       scoreNextMoves: based on context and moves, return a boolean of whether to score nextMoves
*       sortMoves: provided the current context, a list of moves and the score object, returns moves sorted in order to search
*/

module.exports = {
  scoreMoves: scoreMoves
}

// TODO: allow context to include a moveCache
var defaultContext = {
  game: null,
  moves: null,
  prevMove: null,
  haltSearch: null,
  maxDepth: 200,
  depth: 0,
  turn: null,
  game: null,
  path: ''
}

function scoreMoves (options) {
  var context = Object.assign({}, defaultContext, options.context)

  var board = context.game.board
  var evaluate = options.evaluate
  var search = options.search
  var moves = getMoves(context)

  moves.forEach(function (move) {
    if (move.staticEval) return
    board.move(move.verboseMove)
    move.staticEval = evaluate.staticEval({context: context, move: move})
    board.undo()
  })

  search.sortMoves({context: context, moves: moves})

//  console.log('Score path: ' + options.context.path)
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
    board.move(move.verboseMove)
    nextContext.prevMove = move
    nextContext.moves = move.nextMoves
    nextContext.path = context.path + move.simpleMove + ':'

    var nextMoves = scoreMoves({
      context: nextContext,
      evaluate: evaluate,
      search: search
    })

    move.predictiveEval = evaluate.predictiveEval({context: context, move: move, nextMoves: nextMoves})
    move.nextMoves = nextMoves
    board.undo()
  }

  return moves
}

function getMoves (options) {
  if (options.moves) {
    return options.moves
  }

  return options.game.board.moves({verbose: true}).map(function (move) {
    return {
      verboseMove: move,
      simpleMove: simpleMove(move),
      staticEval: null,
      predictiveEval: null,
      nextMoves: null
    }
  })
}

function simpleMove (verboseMove) {
  return verboseMove.from + verboseMove.to + (verboseMove.promotion || '')
}
