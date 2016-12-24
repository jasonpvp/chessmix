/*
*   scoreMoves is responsible for exploring and scoring possible moves
*   It is stateless, but updates state on the collection of moves passed to it
*   This function takes three general sets of options:
*     - context:  the general context of the search, player, turn and current depth of the search
*     - score:    functions for scoring a given board and series of moves leading to that board
*     - search:   the strategy for searching moves
*
*   Options:
*     context:
*       board: the chess board object in a give state
*       moves: options argument to provide previously-searched moves. When not provided, moves are obtained from the board.
*       prevMove: the move the preceded the current board state
*       haltSearch: called before each search recursion if search should be aborted. Current best move is passed to this function
*       depth: current level of recursion in the move search
*       turn: the player moving at the current depth: 1 for white, -1 for black
*       player: the side the engine is playing: 1 for white, -1 for black
*       currentScore: the score of the current board, where < 0 == black advantage, > 0 == white advantage
*     score:
*       staticScore: scores a board at a given state, optionally taking any parameters provided by pathScore
*       predictedScore: used to update the score of a move based on scores of all subsequent moves searched
*     search:
*       scoreNextMoves: based on context and moves, return a boolean of whether to score nextMoves
*       sortMoves: provided the current context, a list of moves and the score object, returns moves sorted in order to search
*/

module.exports = {
  scoreMoves: scoreMoves
}

// TODO: allow context to include a moveCache
var defaultContext = {
  board: null,
  moves: null,
  prevMove: null,
  haltSearch: null,
  maxDepth: 200,
  depth: 0,
  turn: null,
  player: null,
  currentScore: 0
}

function scoreMoves (options) {
  var context = Object.assign({}, defaultContext, options.context)
  var board = context.board
  var score = options.score
  var search = options.search
  var moves = getMoves(context)

  moves.forEach(function (move) {
    if (move.staticScore !== null) return
    move.staticScore = score.staticScore({context: context, move: move})
  })

  search.sortMoves({context: context, moves: moves})

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

    var nextMoves = scoreMoves({
      context: nextContext,
      score: score,
      search: search
    })

    move.predictedScore = score.predictedScore({context: context, move: move, nextMoves: nextMoves})
    move.nextMoves = nextMoves
    board.undo()
  }

  return moves
}

function getMoves (options) {
  if (options.moves) {
    return options.moves
  }

  return options.board.moves({verbose: true}).map(function (move) {
    return {
      verboseMove: move,
      simpleMove: simpleMove(move),
      staticScore: null,
      predictedScore: null,
      nextMoves: null
    }
  })
}

function simpleMove (verboseMove) {
  return verboseMove.from + verboseMove.to + (verboseMove.promotion || '')
}


