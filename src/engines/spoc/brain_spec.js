import { expect } from 'chai'
import Brain from './brain'

function playerLoop (player) {
  describe('brain', () => {
    var brain
    beforeEach(() => {
      console.log('BEFORE EACH ' + player)
      brain = new Brain()
    })
    describe('getNextMove', function () {
      this.timeout(10000)

      it('takes the best piece when its a good move', () => {
        const game = brain.getGame({player: player})
        // give black a choice between taking a queen or a pawn
        game.board.load(setFen('Q7/r7/P7/8/k7/8/8/K7 b KQkq - 0 50', player))

        return brain.getNextMove({game: game, timeLimit: 9, player: player}).then((data) => {
          console.log('MOVE: %o', data)

          expect(data.move.simpleMove).to.eql('a7a8', player + ' should have taken piece\n' + game.board.ascii())
        })
      })

      it('takes a piece when its the best choice', () => {
        const game = brain.getGame({player: player})
        applyMoves(game.board, ['e2e3', 'h7h5', 'd1h5'])
        game.board.load(setFen(game.board.fen(), player))

        return brain.getNextMove({game: game, timeLimit: 9, player}).then((data) => {
          console.log('MOVE: %o', data)

          expect(data.move.simpleMove).to.eql('h8h5', player + ' should have taken piece\n' + game.board.ascii())
        })
      })

      it('does not predict that opponent will fall for stupid tricks', () => {
        const game = brain.getGame({player: player})
        // offer white a pawn in exchange for its queen
        game.board.load(setFen('Q7/p7/r7/8/k7/8/8/K7 b KQkq - 0 50', player))

        return brain.getNextMove({game: game, timeLimit: 9, player}).then((data) => {
          console.log('MOVE: %o', data.prediction.path)
          // Black should not predict that white will give up its queen
          expect(data.prediction.path.slice(0, 4)).to.not.eql('a8a7', player + ' should not have expected opponent to fall for stupid trap\n' + game.board.ascii())
        })
      })
    })
  })
}

([-1, 1]).forEach(player => playerLoop(player))

// reverse black and white pieces if player does not equal the current fen's turn
// doesn't change check-status
function setFen (fen, player) {
  var parts = fen.split(' ')
  if ((player === -1 && parts[1] === 'b') || (player === 1 && parts[1] === 'w')) {
    return fen
  }
  parts[0] = parts[0].replace(/([a-zA-Z])/g, function (a) { if (a === a.toUpperCase()) { return a.toLowerCase()} else { return a.toUpperCase()}})
  if (parts[1] === 'b') {
    parts[1] = 'w'
  } else {
    parts[1] = 'b'
  }
  return parts.join(' ')
}

function applyMoves(board, moves) {
  moves.forEach(move => board.move(move, {sloppy: true}))
}
