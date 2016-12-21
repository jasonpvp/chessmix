var Chess = require('chess.js').Chess
var cardinalScore = require('./cardinal_score').cardinalScore
var newGameFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

module.exports = {
  ChessBrain: ChessBrain
}

/*
*   This chess brain scores the board in multiple, fairly simple ways,
*   and combines each into a single score.
*   Possible paths are explored to shallow depth, first, to reject inferior paths.
*   Paths that pass the shallow check are evaluated further tand scored.
*   The highest-scoring path is returned as the best move.
*
*   All paths that begin with the best move are cached.
*   Subsequent calls can avoid scoring these paths, but consider them with newly scored paths for subsequent moves
*   Ties are broken by random selection
*/

const colorVals = {
  b: -1,
  w: 1
}

function ChessBrain () {
  var state = {}
  resetState()
  var params = {
    maxSearchDepth: 10,
    searchBreadth: 8,
    weights: {
      cardinal: 1,
      scoreDepthFactor: 0.5,    // subMoveScores are added to current score at: score / (depth * weights.scoreDepthFactor)
      goodMoveRatio: 0.75       // the ratio of good to ok moves selected for path search
    },
    scoreThresholds: {
      good: 5,
      bad: -10
    }
  }

  function resetState (options) {
    options = options || {}
    state.currentBoard = getBoard(options)
    state.currentFen = state.currentBoard.fen()
  }

  return {
    reset: function () {
      goodPaths = {}
    },

    getBestMove: function (options) {
      options = options || {}
      if (getFen(options) !== state.currentFen) {
        resetState(options)
      }
      var board = getBoard(options)
      console.log(options)
      console.log(board.ascii())

      var scoredMoves = scoreMoves({
        board: board,
        seenFens: {},
        depth: 0,
        scoreDepth: 0,
        prevMove: {},
        path: '',
        turn: colorVals[board.turn()],
        player: colorVals[board.turn()],
        maxSearchDepth: params.maxSearchDepth,
        searchBreadth: params.searchBreadth,
        scoreThresholds: params.scoreThresholds,
        weights: params.weights
      }).sort(sortForPlayer(board.turn()))

      return scoredMoves[0] || {}
    }
  }
}

function scoreMoves (options) {
  var board = options.board
  // TODO: deal with moves that have cached scores from previous runs
  // TODO: consider a global cache for moves keyed from fen states to avoid duplicating path traversal when various moves reconverge to a common state
  var moves = options.moves || getMoves({board: board})

  // safety valve to make up for lack of tests
  // TODO: tests
  var fen = board.fen()
  if (options.seenFens[fen]) return options.moves
  options.seenFens[fen] = true

  var selectedMoves
  var scoredMoves
  if (options.depth === options.scoreDepth || options.depth === options.maxSearchDepth) {
//    console.log('score moves at depth: ' + options.depth)
    scoredMoves = moves.map(function (move) { return scoreMove({board: board, move: move})}).sort(sortForPlayer(options.turn))
  }
  if (options.depth === 0) console.log('dpth) ' + options.depth + ', eval ' + moves.length + ' moves from ' + options.prevMove.nextMove + ': ' + moves.map(function (m) { return m.nextMove + '(' + m.score + ')'}).join(', '))

  // TODO: also return score on checkmate
  if (options.depth === options.maxSearchDepth) {
    console.log('reached maxDepth: ' + options.maxSearchDepth + ', path: ' + options.path)
    return scoredMoves
  }

  if (scoredMoves) {
    selectedMoves = scoredMoves.filter(function (scoredMove) {
      return scoredMove.score >= options.scoreThresholds.good
if (move.nextMove === 'd8g5') console.log(scoredMove)
    }).slice(0, options.searchBreadth)

    var okMoves = shuffleArray(scoredMoves.filter(function (scoredMove) {
      return scoredMove.score < options.scoreThresholds.good && scoredMove.score > options.scoreThresholds.bad
    })).slice(0, options.searchBreadth - selectedMoves.length)

    selectedMoves.push.apply(selectedMoves, okMoves)
  } else {
    selectedMoves = shuffleArray(moves).slice(0, options.searchBreadth)
  }

  selectedMoves.sort(sortForPlayer(options.turn)).forEach(function (move) {
    board.move(move.nextMove, {sloppy: true})
//    process.stdout.write(move.nextMove + ', ')
    // subMoves are cached for each move, so the final move will have some scored already
//    move.subMoves = move.subMoves || getMoves({board: board})
    var subDepth = options.depth + 1
    var scoredSubMoves = scoreMoves({
      board: board,
      seenFens: options.seenFens,
      prevMove: move,
      path: options.path + move.nextMove + '(' + move.score.toFixed(1) +  '), ',
      moves: getMoves({board: board}),
      depth: subDepth,
      turn: options.turn * -1,
      player: options.player,
      scoreDepth: options.scoreDepth + 1, // score at each step
      maxSearchDepth: options.maxSearchDepth,
      searchBreadth: Math.ceil(options.searchBreadth / 2),
      scoreThresholds: options.scoreThresholds,
      weights: options.weights
    })
    board.undo()
    move.score += scoredSubMoves.reduce(function (sum, m) {
      return sum + m.score / (subDepth * options.weights.scoreDepthFactor)
    }, 0) * options.turn
    if (options.depth === 0) {
      console.log('Move) ' + move.nextMove + ', score: ' + move.score)
    }
//    move.subMoves = scoredSubMoves
  })

  return selectedMoves
}

function scoreMove (options) {
  var board = options.board
//console.log('move fro scoring ' + board.fen())
  board.move(options.move.nextMove, {sloppy: true})
  var score = cardinalScore(board, options.move.nextMove)
  options.move.score = score
//console.log('undo for scoring')
  board.undo()
  return options.move
}

function getBoard (options) {
  options = options || {}
  var board = options.board || new Chess()
  if (options.fen) {
    board.load(options.fen)
  } else {
    board.load(newGameFen)
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

function getFen(options) {
  options = options || {}
  if (options.fen && !options.moves) return options.fen
  return getBoard(options).fen()
}

function getMoves (options) {
  return options.board.moves({verbose: true}).map(function (move) {
//    if (simpleMove(move) == 'h3g4') console.log(scoreMove({board: options.board, move: move}))
    return {
      move: move,
      nextMove: simpleMove(move), // TODO: make client use just move
      score: 0,
      subMoves: null
    }
  })
}

function keyFromMoves (moves) {
  return moves.join(':')
}

function movesFromKey (moveKey) {
  return moveKey.split(':')
}

function simpleMove (verboseMove) {
  return verboseMove.from + verboseMove.to + (verboseMove.promotion || '')
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

function sortByScoreDesc (a, b) {
  if (a.score < b.score) return 1
  if (a.score > b.score) return -1
  return 0
}

function sortByScoreAsc (a, b) {
  if (a.score > b.score) return 1
  if (a.score < b.score) return -1
  return 0
}

function sortForPlayer (player) {
  if (player === 'b' || player === -1) return sortByScoreAsc
  return sortByScoreDesc
}
