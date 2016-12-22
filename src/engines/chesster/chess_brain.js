var synaptic = require('synaptic')
var Chess = require('chess.js').Chess

module.exports = {
  ChessBrain: ChessBrain
}

function ChessBrain () {
  var network = new synaptic.Architect.Perceptron(256, 64, 16, 4, 1)
  var learningRate = 0.3

  return {
    network: network,
    trainFenBoard: function (fen, score) {
      var scoreBoard = new Chess()
      scoreBoard.load(fen)
      var binBoard = asciiBoardToBinary(scoreBoard.ascii())
      network.propagate(learningRate, [score])
      return scoreMove(network, binBoard)
    },
    getBestMove: function (board) {
      var moves = board.moves({verbose: true})
      var baseScore = scoreMove(network, asciiBoardToBinary(board.ascii()))[0]
      var boardFen = board.fen()
      var scoredMoves = shuffleArray(moves).map(function (move, i) {
        var scoredMove = {
          index: i,
          nextMove: move.from + move.to + (move.promotion || ''),
          nextMoveVerbose: move
        }

        board.move(move)
        if (board.in_threefold_repetition()) {
          scoredMove.score = -1
        } else {
          var binBoard = asciiBoardToBinary(board.ascii())
          scoredMove.score = scoreMove(network, binBoard)[0]
        }
        board.undo()
        return scoredMove
      }).sort(function (a, b) { return (a.score < b.score) ? 1 : (a.score > b.score) ? -1 : 0})

      return scoredMoves[0] || {}
    },
    train: function (targetScore) {
      network.propagate(learningRate, [targetScore])
    }
  }
}

function scoreMove (network, binBoard) {
  return network.activate(binBoard)
}

function outputToScore (output) {
  return parseInt(output.join(''), 2)
}

function asciiBoardToBinary (ascii) {
  var rows = ascii.split(/\n/)
  var bin = rows.reduce(function (bin, row) {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return bin
    var values = row.slice(5, 27).split(/\ +/).map(pieceToValue)
    values.forEach(function (v) { return bin.push.apply(bin, v)})
    return bin
  }, [])
  return bin
}

function verboseMoveToBinary (move) {
  return moveToBinary(move.from + move.to)
}

function moveToBinary (move) {
  var from = cellToBinary(move.slice(0, 2))
  var to = cellToBinary(move.slice(2, 4))
  var promote = pieceValues[move[4] || '.']
  return from.concat(to).concat(promote)
}

function cellToBinary (cell) {
  var col = cell[0].toLowerCase().charCodeAt() - 97
  return numToBin(col).concat(numToBin(cell[1] - 1))
}

function numToBin (num) {
  var bin = (num >>> 0).toString(2).split('').map(function (n) { return parseInt(n, 2)})
  return padBinArray(bin, 3)
}

function padBinArray (arr, len) {
  return Array(len).fill(0).slice(0, len - arr.length).concat(arr)
}

var pieceValues = {
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
