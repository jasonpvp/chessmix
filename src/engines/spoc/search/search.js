module.exports = {
  scoreNextMoves: scoreNextMoves,
  sortMoves: sortMoves
}

function scoreNextMoves (options) {
  return true
}

// TODO: randomize with respect to good, ok and bad moves
function sortMoves (options) {
  if (options.context.turn === options.context.game.player) {
    return options.moves.sort(sortByScoreDesc)
  } else {
    return options.moves.sort(sortByScoreAsc)
  }
}

function sortByScoreDesc (a, b) {
  if (a.staticScore < b.staticScore) return 1
  if (a.staticScore > b.staticScore) return -1
  return 0
}

function sortByScoreAsc (a, b) {
  if (a.staticScore > b.staticScore) return 1
  if (a.staticScore < b.staticScore) return -1
  return 0
}
