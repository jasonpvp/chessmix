module.exports = {
  scoreNextMoves: scoreNextMoves,
  sortMoves: sortMoves
}

function scoreNextMoves (options) {
  return true
}

// TODO: randomize with respect to good, ok and bad moves
function sortMoves (options) {
  var searchCount
  var goodCount = 5
  var moveCount = options.moves.length
  if (options.context.depth < 2) {
    searchCount = (10 <= moveCount) ? 10 : moveCount
  } else if (options.context.depth < 4) {
    searchCount = 2
  } else {
    searchCount = 1
  }

  if (options.context.turn === options.context.game.player) {
    options.moves.sort(sortByScoreDesc)
  } else {
    options.moves.sort(sortByScoreAsc)
  }
  if (searchCount === moveCount) {
    return options.moves
  }

  var searchMoves
  if (searchCount > goodCount) {
    searchMoves = options.moves.slice(0,goodCount)
    var remainCount = searchCount - goodCount
    var interval = Math.floor((moveCount - goodCount) / remainCount) || 1
    for (var i = 0; i < remainCount; i++) {
      var move = options.moves[goodCount + i * interval]
      if (move) searchMoves.push(move)
    }
  } else {
    searchMoves = options.moves.slice(0, searchCount)
  }
  return searchMoves
}

function sortByScoreDesc (a, b) {
  if (a.staticEval.absScore < b.staticEval.absScore) return 1
  if (a.staticEval.absScore > b.staticEval.absScore) return -1
  return 0
}

function sortByScoreAsc (a, b) {
  if (a.staticEval.absScore < b.staticEval.absScore) return -1
  if (a.staticEval.absScore > b.staticEval.absScore) return 1
  return 0
}
