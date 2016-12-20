var Chess = require('chess.js').Chess
var cardinalScore = require('./cardinalScore/cardinalScore.js')
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

function ChessBrain () {
  var state = {}
  resetState()
  var params = {
    maxSearchDepth: 64,
    searchBreadth: 8,
    weights: {
      cardinal: 1,
      scoreDepthFactor: 0.5     // subMoveScores are added to current score at: score / (depth * weights.scoreDepthFactor)
    },
    scoreThresholds: {
      good: 5
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
      if (getFen(options) !== currentFen) {
        resetState(options)
      }

      var scoredMoves = scoreMoves({
        board: board,
        depth: 0,
        scoreDepth: 1,
        maxSearchDepth: params.maxSearchDepth,
        searchBreadth: params.searchBreadth,
        scoreThresholds: params.scoreThresholds,
        weights: params.weights
      })

      var moves = board.moves({verbose: true})
      var scoredMoves = shuffleArray(moves).map(function (move, i) {
        var scoredMove = {
          index: i,
          move: move.from + move.to + (move.promotion || ''),
          verboseMove: move
        }

        return scoredMove
      }).sort(function (a, b) { return (a.score < b.score) ? 1 : (a.score > b.score) ? -1 : 0})

      return scoredMoves[0] || {}
    }
  }
}

function scoreMoves (options) {
  var board = getBoard(options)
  // TODO: deal with moves that have cached scores from previous runs
  // TODO: consider a global cache for moves keyed from fen states to avoid duplicating path traversal when various moves reconverge to a common state
  var moves = options.moves || getMoves({board: board})
  var selectedMoves
  var scoredMoves

  if (options.depth === options.scoreDepth || options.depth === options.maxSearchDepth) {
    scoredMoves = moves.map(scoreMove).sort(sortByScoreDesc)
  }

  if (options.depth === options.maxSearchDepth) {
    return scoredMoves
  }

  if (scoredMoves) {
    selectedMoves = scoredMoves.filter(function (scoredMove) {
      return scoredMove.score >= options.scoreThresholds.good
    }).slice(0, options.searchBreadth)

    if (selectedMoves.length < options.searchBreadth) {
      var okMoves = shuffleArray(scoredMoves.filter(function (scoredMove) {
        return scoredMove.score < options.scoreThresholds.good && scoredMove.score > options.scoreThresholds.bad
      })).slice(0, options.searchBreadth - selectedMoves.length)

      selectedMoves.push.apply(selectedMoves, okMoves)
    }
  } else {
    selectedMoves = shuffleArray(moves).slice(0, options.searchBreadth)
  }

  selectedMoves.forEach(function (move) {
    board.move(move.move)
    // subMoves are cached for each move, so the final move will have some scored already
    move.subMoves = move.subMoves || getMove({board: board})

    var subDepth = options.depth + 1
    var scoredSubMoves = scoreMoves({
      board: board,
      moves: move.subMoves,
      depth: subDepth,
      scoreDepth: options.scoreDepth * 2,
      maxSearchDepth: params.maxSearchDepth,
      searchBreadth: params.searchBreadth,
      scoreThresholds: params.scoreThresholds,
      weights: params.weights
    })
    board.undo()
    move.score += scoredSubMoves.reduce(function (sum, m) {
      return sum + m.score / (subDepth * options.weights.scoreDepthFactor)
    }, 0)
  })

  return selectedMoves
}

function getBoard (options) {
  options = options || {}
  var board = options.board || new Chess()
  if (options.fen) {
    board.load(options.fen)
  } else {
    board.load(newGamFen)
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
  return options.board.moves().map(function (move) {
    return {
      move: move,
      score: 0,
      subMoves: []
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


