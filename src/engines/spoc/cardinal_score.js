module.exports = {
  cardinalScore: cardinalScore
}

const pieceValues = {
  p: -1,
  n: -2,
  b: -3,
  r: -4,
  q: -5,
  k: -6,
  P: 1,
  N: 2,
  B: 3,
  R: 4,
  Q: 5,
  K: 6
}

const pieceWeights = {
  p: 1,
  n: 1,
  b: 1,
  r: 1,
  q: 2,
  k: 10000,
  P: 1,
  N: 1,
  B: 1,
  R: 1,
  Q: 2,
  K: 10000
}

function cardinalScore (board, move) {
  var boardArray = asciiBoardToArray(board.ascii())
  var score = boardArray.reduce(function (sum, val) {
    return sum + val
  }, 0)
//  if (move == 'd8g5') console.log ('score: ' + score + ', board: ' + JSON.stringify(boardArray))

  return score
}

function asciiBoardToArray (ascii) {
  var rows = ascii.split(/\n/)
  var bin = rows.reduce(function (bin, row) {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return bin
    var values = row.slice(5, 27).split(/\ +/).map(pieceToValue)
    bin.push.apply(bin, values)
    return bin
  }, [])
  return bin
}

function pieceToValue (piece) {
  return (pieceValues[piece] || 0) * (pieceWeights[piece] || 0)
}


