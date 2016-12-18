import synaptic from 'synaptic'
import Chess from 'chess.js'

export function ChessBrain () {
  var network = new synaptic.Architect.Perceptron(256, 128, 64, 32, 16, 8, 4, 2, 1)
  var learningRate = 0.3
  var lastMove
  var scoreBoard = new Chess()

  return {
    network: network,
    getBestMove: function (board, moves) {
      const baseScore = scoreMove(network, asciiBoardToBinary(board.ascii()))[0]
      const boardFen = board.fen()

      const scoredMoves = shuffleArray(moves).map(move => {
        scoreBoard.load(board.fen())
        scoreBoard.move(move)
        const binBoard = asciiBoardToBinary(scoreBoard.ascii())
        const output = scoreMove(network, binBoard)

        return {
          move,
          output,
          start: boardFen,
          end: scoreBoard.fen(),
          binBoard: binBoard,
          score: output.reduce((s, v) => s + v, 0) / 4
        }
      }).sort((a, b) => { (a.score < b.score) ? 1 : (a.score > b.score) ? -1 : 0})

      //console.log('scored: %o', scoredMoves)
      lastMove = scoredMoves[0]
      return scoredMoves[0]
    },
    train: function (targetScore) {
      if (!lastMove) return
      // assume the score is in -40..40
      const brainScore = (targetScore + 40) / 80
      console.log('train with score: %s %s', targetScore, brainScore)
      scoreMove(network, lastMove.binBoard)
      network.propagate(learningRate, [brainScore])
    }
  }
}

function scoreMove (network, binBoard) {
  return network.activate(binBoard)
}

function outputToScore (output) {
  return parseInt(output.join(''), 2)
}

export function asciiBoardToBinary (ascii) {
  const rows = ascii.split(/\n/)
  var bin = rows.reduce((bin, row) => {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return bin
    const values = row.slice(5, 27).split(/\ +/).map(pieceToValue)
    values.forEach(v => bin.push.apply(bin, v))
    return bin
  }, [])
  return bin
}

function verboseMoveToBinary (move) {
  return moveToBinary(move.from + move.to)
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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
