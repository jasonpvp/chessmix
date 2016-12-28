import { expect } from 'chai'
import Brain from './brain'

// Each of these tests is run for black and white players
// The tests are written from the perspective of white
// Then inverted to run as white
// When moves are provided and the test is being run as white
// whiteLead is played first to take turns in the correct order
function playerLoop (player) {
  describe('brain', () => {
    var brain
    var game
    var gameId = 1
    var playerColor, opponentColor
    beforeEach(function () {
      if (player === 1) {
        playerColor = 'w'
        opponentColor = 'b'
      } else {
        playerColor = 'b'
        opponentColor = 'w'
      }
      console.log('Test: Player ' + player + ' ' + this.currentTest.title)
      brain = new Brain()
    })
    afterEach(function () {
      console.log('Test board result: Player ' + player + ' ' + this.currentTest.title)
      console.log(game.board.ascii())
    })
    describe('getNextMove', function () {
      this.timeout(10000)

//      it('takes the best piece when its a good move', () => {
//        game = brain.getGame({player: player, gameId: gameId})
//        // give black a choice between taking a queen or a pawn
//        game.board.load(setFen('Q7/r7/P7/8/k7/8/8/K7 b KQkq - 0 50', player))
//
//        return brain.getNextMove({game: game, timeLimit: 9, player: player}).then((data) => {
//          console.log('MOVE: %o', data)
//
//          expect(data.move.simpleMove).to.eql('a7a8', player + ' should have taken piece\n' + game.board.ascii())
//        })
//      })

      it('takes a piece when its the best choice', () => {
        game = brain.getGame({player: player, gameId: gameId})
        setupBoard({
          board: game.board,
          player: player,
          moves: ['e7e6', 'h2h3', 'f8a3'],
          whiteLead: 'c2c3'
        })

        return brain.getNextMove({game: game, timeLimit: 9, player}).then((data) => {
          console.log('Checking cell ' + cellForPlayer('a3', player))
          const piece = game.board.get(cellForPlayer('a3', player))
          expect(piece).to.not.eql({type: 'b', color: opponentColor}, player + ' should have taken piece')
        })
      })

//      it('does not predict that opponent will fall for stupid tricks', () => {
//        game = brain.getGame({player: player, gameId: gameId})
//        // offer white a pawn in exchange for its queen
//        game.board.load(setFen('Q7/p7/r7/8/k7/8/8/K7 b KQkq - 0 50', player))
//
//        return brain.getNextMove({game: game, timeLimit: 9, player}).then((data) => {
//          console.log('MOVE: %o', data.prediction.path)
//          // Black should not predict that white will give up its queen
//          expect(data.prediction.path.slice(0, 4)).to.not.eql('a8a7', player + ' should not have expected opponent to fall for stupid trap\n' + game.board.ascii())
//        })
//      })
    })
  })
}

([-1, 1]).forEach(player => playerLoop(player))

function setupBoard(options) {
  if (options.fen) {
    options.board.load(fen)
    if (options.player === -1) {
      invertBoard(options)
    }
  }
  if (options.moves) {
    if (options.player === 1) {
      console.log('Move: ' + options.whiteLead)
      options.board.move(options.whiteLead, {sloppy: true})
    }
    options.moves.forEach(move => {
      if (options.player === -1) move = invertMove(move)
      console.log('Move: ' + move)
      options.board.move(move, {sloppy: true})
    })
  }
}

function invertBoard (options) {
  var cells = {}
  for (var i = 1; i < 9; i++) {
    for (var j = 1; j < 9; j++) {
      var cell = String.fromCharCode(96 + i) + j
      cells[cell] = board.get(cell)
    }
  }
  Object.keys(cells).forEach(cell => {
    board.put(invertPiece(cells[cell]), cell)
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
  if (piece.color === 'b') {
    piece.color = 'w'
  } else {
    piece.color = 'b'
  }
}
