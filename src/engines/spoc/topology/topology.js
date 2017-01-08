/*
* for each piece:
* where it can move to next
* which squares it can take
* all the squares it can get to on the board without being taken, weighted by how many moves it takes to get there
* proximity to the king
* how well guarded it is by other pieces
* how much risk it is in from other pieces
* One view of the data encodes all of this info explicitly
* One view of the data weights each square based on all the above
*/

module.exports = function Topology (fen) {
  var board = new Board()
  board.load(fen)
  return board
}

function Board () {
  this.reset()
}

Board.prototype.reset = function () {
  this.board = emptyGrid()
}

function emptyGrid () {
  return Array(8).fill(0).map(function () { return Array(8).fill(0) })
}

Board.prototype.load = function (fen) {
  this.reset()
  var parts = fen.split(' ')
  var fenPieces = parts[0]
  this.turn = playerValues[parts[1]]
  var castle = parts[2]
  var passant = parts[3]
  var halfClock = parts[4]
  var fullClock = parts[5]
  this.loadBoard(fenPieces)
}

Board.prototype.loadBoard = function (fenPieces) {
  var rows = fenPieces.split('/')
  var view = this
  rows.forEach(function (row, i) {
    var j = 0
    row.split('').forEach(function (p) {
      var n = parseInt(p, 10)
      if (Number.isNaN(n)) {
        view.board[i][j] = pieceValues[p]
        j++
      } else {
        j += n
      }
    })
  })
}

Board.prototype.pointTopology = function () {
  var colors = this.topology().reduce(function (colors, row) {
    return row.reduce(function (colors, cell) {
      var color = sign(cell)
      colors[color] += Math.abs(cell)
      return colors
    }, colors)
  }, {'1': 0, '-1': 0})

  var ttl = colors[-1] + colors[1]
  if (ttl === 0 || colors[-1] === colors[1]) return 0

  var advantage = (colors[-1] > colors[1]) ? -1 : 1
  return (colors[advantage] / ttl) * advantage
}

Board.prototype.normalizedTopology = function () {
  var topology = this.topology()
  var max = topology.reduce(function (max, row) {
    return row.reduce(function (max, cell) {
      var val = Math.abs(cell)
      return (val > max) ? val : max
    }, max)
  }, 0)
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      topology[i][j] = topology[i][j] / max
    }
  }
  return topology
}

Board.prototype.topology = function () {
  var topology = emptyGrid()
  var board = this.board
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var applyPieceTopology = pieceTopologies[Math.abs(board[i][j])]
      applyPieceTopology(board, topology, i, j)
    }
  }
  return topology
}

var pieceValues = {
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

var pieceTopologies = {
  0: function () {},
  1: applyPawnTopology,
  2: applyKnightTopology,
  3: applyBishopTopology,
  4: applyRookTopology,
  5: applyQueenTopology,
  6: applyKingTopology
}

var playerValues = {
  w: 1,
  b: -1
}

function applyPawnTopology (board, topology, i, j) {
  var color = sign(board[i][j])
  var dir = color * -1
  var nextRow = i + dir
  if (board[nextRow][j] === 0) {
    // move forward 1 row
    topology[nextRow][j] += color

    var inStartPos = (i === 1 && dir === 1) || (i === 6 && dir === -1)
    if (inStartPos && board[nextRow + dir][j] === 0) {
      // move forward 2 rows
      topology[nextRow + dir][j] += color
    }
  }
  if (j > 0) {
    // capture left
    topology[nextRow][j - 1] += color
  }
  if (j < 7) {
    // capture right
    topology[nextRow][j + 1] += color
  }
  if ((i === 4 && dir === 1) || (i === 3 && dir === -1)) {
    var left = j - 1
    // capture left en passant
    if (j > 0 && board[i][left] === 0 && board[nextRow][left] === 0 && board[nextRow + dir][left] === color * -1) {
      topology[nextRow][left] += color
    }
    var right = j + 1
    // capture right en passant
    if (j < 7 && board[i][right] === 0 && board[nextRow][right] === 0 && board[nextRow + dir][right] === color * -1) {
      topology[nextRow][right] += color
    }
  }
}

function applyKnightTopology (board, topology, i, j) {
  var color = sign(board[i][j])
  var dirs = [-1, 1]
  dirs.forEach(function (h) {
    dirs.forEach(function (v) {
      applyMoveTopology(topology, i + h * 2, j + v, color)
      applyMoveTopology(topology, i + h, j + v * 2, color)
    })
  })
}

function applyMoveTopology (topology, i, j, color) {
  if (i > -1 && i < 8 && j > -1 && j < 8) {
    topology[i][j] += color
    return true
  }
  return false
}

function applyBishopTopology (board, topology, i, j) {
  applyLinearTopology(board, topology, i, j, -1, -1)
  applyLinearTopology(board, topology, i, j, -1, 1)
  applyLinearTopology(board, topology, i, j, 1, -1)
  applyLinearTopology(board, topology, i, j, 1, 1)
}

function applyRookTopology (board, topology, i, j) {
  applyLinearTopology(board, topology, i, j, 1, 0)
  applyLinearTopology(board, topology, i, j, -1, 0)
  applyLinearTopology(board, topology, i, j, 0, 1)
  applyLinearTopology(board, topology, i, j, 0, -1)
}

function applyQueenTopology (board, topology, i, j) {
  applyBishopTopology(board, topology, i, j)
  applyRookTopology(board, topology, i, j)
}

function applyKingTopology (board, topology, i, j) {
  var color = sign(board[i][j])
  for (var x = i - 1; x < i + 2; x++) {
    for (var y = j - 1; y < j + 2; y++) {
      if ((x !== i || y !== j)) {
        applyMoveTopology(topology, x, y, color)
      }
    }
  }
}

function applyLinearTopology (board, topology, i, j, di, dj) {
  var color = sign(board[i][j])
  var occupied = false
  i += di
  j += dj
  while (!occupied && applyMoveTopology(topology, i, j, color)) {
    occupied = (board[i][j] !== 0)
    i += di
    j += dj
  }
}

function sign (num) {
  if (num >= 0) return 1
  return -1
}
