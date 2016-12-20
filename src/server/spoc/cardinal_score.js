module.exports = {
  cardinalScore: cardinalScore
}

function cardinalScore (boardArray) {
  var boardArray = asciiBoardToArray(board.ascii())

}

function asciiBoardToArray (ascii) {
  var rows = ascii.split(/\n/)
  var bin = rows.reduce(function (bin, row) {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return bin
    var values = row.slice(5, 27).split(/\ +/).map(pieceToValue)
    values.forEach(function (v) { return bin.push.apply(bin, v)})
    return bin
  }, [])
  return bin
}

function pieceToValue (piece) {
  return pieceValues[piece] || 0
}

const pieceValues = {
  k: 1,
  p: 2,
  n: 3,
  b: 4,
  r: 5,
  q: 6,
  K: -1,
  P: -2,
  N: -3,
  B: -4,
  R: -5,
  Q: -6
}


