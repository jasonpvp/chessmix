import synaptic from 'synaptic'

function brain () {
  var nn = new synaptic.Architect.Perceptron(2048, 64, 32, 8)
}

export function boardToBinary (chess) {
  const ascii = chess.ascii()
  const rows = ascii.split(/\n/)
  var bin = rows.reduce((bin, row) => {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return bin
    const values = row.slice(5, 27).split(/\ +/).map(pieceToValue)
    values.forEach(v => bin.push.apply(bin, v))
    return bin
  }, [])
  return bin
}

export function moveToBinary (move) {
  const from = cellToBinary(move.slice(0, 2))
  const to = cellToBinary(move.slice(2, 4))
  const promote = pieceValues[move[4] || '.']
  return from.concat(to).concat(promote)
}

function cellToBinary (cell) {
  const col = cell[0].toLowerCase().charCodeAt() - 97
  return numToBin(col).concat(numToBin(cell[1] - 1))
}

function numToBin (num) {
  let bin = (num >>> 0).toString(2).split('').map(n => parseInt(n, 2))
  return padBinArray(bin, 3)
}

function padBinArray (arr, len) {
  return Array(len).fill(0).slice(0, len - arr.length).concat(arr)
}

const pieceValues = {
  '.': [0, 0, 0, 0],
  'p': [0, 0, 0, 1],
  'r': [0, 0, 1, 0],
  'n': [0, 0, 1, 1],
  'b': [0, 1, 0, 0],
  'q': [0, 1, 0, 1],
  'k': [0, 1, 1, 0],
  'P': [1, 0, 0, 1],
  'R': [1, 0, 1, 0],
  'N': [1, 0, 1, 1],
  'B': [1, 1, 0, 0],
  'Q': [1, 1, 0, 1],
  'K': [1, 1, 1, 0],
}

function pieceToValue (p) {
  return pieceValues[p]
}
