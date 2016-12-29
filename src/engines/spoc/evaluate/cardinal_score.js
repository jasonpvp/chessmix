var pieceValues = require('./piece_values').pieceValues

module.exports = {
  cardinalScore: cardinalScore
}

const pieceWeights = {
  p: 1,
  n: 1,
  b: 1,
  r: 1,
  q: 2,
  k: 100,
  P: 1,
  N: 1,
  B: 1,
  R: 1,
  Q: 2,
  K: 100
}

function cardinalScore (options) {
  var score = options.boardArray.reduce(function (boardSum, rowArray) {
    var rowSum = rowArray.reduce(function (sum, piece) {
      return sum + pieceScore(piece)
    }, 0)
    return boardSum + rowSum
  }, 0)

  return score
}

function pieceScore (piece) {
  return (pieceValues[piece] || 0) * (pieceWeights[piece] || 0)
}
