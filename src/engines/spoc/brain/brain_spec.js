import { expect } from 'chai'
import Brain from './brain'

// Each of these tests is run for black and white players
// The tests are written from the perspective of white
// Then inverted to run as white
// When moves are provided and the test is being run as white
// whiteLead is played first to take turns in the correct order
function playerLoop (player) {
  describe('brain', () => {
    var brain, playerColor, opponentColor

    beforeEach(function () {
      if (player === 1) {
        playerColor = 'w'
        opponentColor = 'b'
      } else {
        playerColor = 'b'
        opponentColor = 'w'
      }
      console.log('Test: Player ' + player + ' ' + this.currentTest.title)
      brain = new Brain({player: player})
    })
    afterEach(function () {
      console.log('Test board result: Player ' + player + ' ' + this.currentTest.title)
      console.log(brain.board.ascii())
    })
    describe('getNextMove', function () {
      this.timeout(10000)

      it('takes the best piece when its an obvious choice', () => {
        setupBoard({
          board: brain.board,
          fen: 'q7/R7/K7/8/k7/8/8/8 w KQkq - 0 50',
          player: player
        })

        return brain.getNextMove({timeLimit: 9}).then((data) => {
          let piece = brain.board.get(cellForPlayer('a8', player))
          expect(piece).to.not.eql({type: 'q', color: opponentColor}, player + ' should have taken piece')

          piece = brain.board.get(cellForPlayer('a7', player))
          expect(piece).to.eql(null, player + ' should have taken piece with its rook')
        })
      })

      it('takes a piece when its the best choice', () => {
        setupBoard({
          board: brain.board,
          player: player,
          whiteLead: 'c2c3',
          moves: ['e7e6', 'h2h3', 'f8a3']
        })

        return brain.getNextMove({timeLimit: 9}).then((data) => {
          const piece = brain.board.get(cellForPlayer('a3', player))
          expect(piece).to.not.eql({type: 'b', color: opponentColor}, player + ' should have taken piece')
        })
      })

      it('does not predict that opponent will fall for stupid tricks', () => {
        setupBoard({
          board: brain.board,
          player: player,
          fen: 'q1k5/p1p5/R7/K1P5/8/8/8/8 w KQkq - 0 50'
        })

        return brain.getNextMove({timeLimit: 9}).then((data) => {
          const piece = brain.board.get(cellForPlayer('c6', player))
          expect(piece).to.not.eql({type: 'p', color: playerColor}, player + ' should have taken piece')
        })
      })
    })
  })
}

([-1, 1]).forEach(player => playerLoop(player))

function setupBoard(options) {
  if (options.fen) {
    if (options.player === -1) {
      var parts = options.fen.split(' ')
      parts[1] = (parts[1] === 'w') ? 'b' : 'w'
      parts[4] = 1
      options.fen = parts.join(' ')
    }
    console.log('load fen: ' + options.fen)
    options.board.load(options.fen)

    if (options.player === -1) {
      console.log('Invert board')
      invertBoard(options)
    }
  }
  if (options.moves) {
    if (options.player === 1 && options.whiteLead) {
      console.log('Move: ' + options.whiteLead)
      options.board.move(options.whiteLead, {sloppy: true})
    }
    options.moves.forEach(move => {
      if (options.player === -1) move = invertMove(move)
      console.log('Move: ' + move)
      options.board.move(move, {sloppy: true})
    })
  }
  console.log(options.board.turn() + ' to move')
}

function invertBoard (options) {
  var cells = {}
  for (var i = 1; i < 9; i++) {
    for (var j = 1; j < 9; j++) {
      var cell = String.fromCharCode(96 + i) + j
      cells[cell] = options.board.get(cell)
    }
  }

  options.board.load('8/8/8/8/8/8/8/8 b KQkq - 0 50')
  Object.keys(cells).forEach(cell => {
    var piece = invertPiece(cells[cell])
    if (piece) {
      options.board.put(piece, invertCell(cell))
    } else {
      options.board.remove(invertCell(cell))
    }
  })
}

function cellForPlayer (cell, player) {
  if (player === -1) {
    return invertCell(cell)
  } else {
    return cell
  }
}

function moveForPlayer(move, player) {
  if (player === -1) {
    return invertMove(move)
  } else {
    return move
  }
}

function invertMove (move) {
  return invertCell(move.slice(0, 2)) + invertCell(move.slice(2, 4))
}

function invertCell (cell) {
  var col = cell[0]
  var row = cell[1]
  return String.fromCharCode(105 - col.charCodeAt(0) + 96) + (9 - row)
}

function invertPiece (piece) {
  if (!piece) {
    return piece
  }
  if (piece.color === 'b') {
    piece.color = 'w'
  } else {
    piece.color = 'b'
  }
  return piece
}
