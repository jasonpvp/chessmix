import { expect } from 'chai'
import Brain from './brain'

function playerLoop (player) {
  describe('brain', () => {
    var brain
    beforeEach(() => {
      console.log('BEFORE EACH')
      brain = new Brain()
    })
    describe('getNextMove', function () {
      this.timeout(10000)

      it('takes the best piece when its a good move', () => {
        const game = brain.getGame({player: player})
        // give black a choice between taking a queen or a pawn
        game.board.load('Q7/r7/P7/8/k7/8/8/K7 b KQkq - 0 50')

        return brain.getNextMove({game: game, timeLimit: 1.5}).then((data) => {
          console.log('MOVE: %o', data)

          expect(data.move.simpleMove).to.eql('a7a8')
        })
      })

      it('does not predict that opponent will fall for stupid tricks', () => {
        const game = brain.getGame({player: player})
        // offer white a pawn in exchange for its queen
        game.board.load('Q7/p7/r7/8/k7/8/8/K7 b KQkq - 0 50')

        return brain.getNextMove({game: game, timeLimit: 10}).then((data) => {
          console.log('MOVE: %o', data.prediction.path)
          // Black should not predict that white will give up its queen
          expect(data.prediction.path.slice(0, 4)).to.not.eql('a8a7')
        })
      })
    })
  })
}

([-1, 1]).forEach(player => playerLoop(player))
