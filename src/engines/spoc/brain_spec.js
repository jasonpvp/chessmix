import { expect } from 'chai'
import Brain from './brain'

describe('brain', () => {
  var brain
  beforeEach(() => {
    brain = new Brain()
  })
  describe('getNextMove', () => {
    it('takes the best piece when its a good move', () => {
      const game = brain.getGame({player: -1})
      // give black a choice between taking a queen or a pawn
      game.board.load('Q7/r7/P7/8/k7/8/8/K7 b KQkq - 0 50')

      return brain.getNextMove({game: game, timeLimit: 1.5}).then((data) => {
        console.log('MOVE: %o', data)

        expect(data.move.simpleMove).to.eql('a7a8')
      })
    })
  })
})
