module.exports = {
  scoreNextMoves: scoreNextMoves,
  sortMoves: sortMoves
}

function scoreNextMoves (options) {
  return true
}

// TODO: randomize with respect to good, ok and bad moves
function sortMoves (options) {
  var searchCount = (options.context.depth === 0) ? options.moves.length : 1//Math.ceil(4 / options.context.depth)
  if (options.context.turn === options.context.game.player) {
    return options.moves.sort(sortByScoreDesc).slice(0, searchCount)
  } else {
    return options.moves.sort(sortByScoreAsc).slice(0, searchCount)
  }
}

function sortByScoreDesc (a, b) {
  if (a.staticEval.score < b.staticEval.score) return 1
  if (a.staticEval.score > b.staticEval.score) return -1
  return 0
}

function sortByScoreAsc (a, b) {
  if (a.staticEval.score > b.staticEval.score) return 1
  if (a.staticEval.score < b.staticEval.score) return -1
  return 0
}
