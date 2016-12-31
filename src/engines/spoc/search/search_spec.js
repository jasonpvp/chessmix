import { expect } from 'chai'
import Search from './search'

describe('sortMoves', () => {
  var search
  beforeEach(() => {
    search = new Search()
  })

  it('sorts descending when it is players turn', () => {
    var moves = movesWithScores([-1,0,2,3], -1)
    var context = {
      depth: 0,
      turn: -1,
      player: -1
    }
    var sortedMoves = search.sortMoves({context: context, moves: moves})
    expect(sortedMoves.map(m => m.staticEval.absScore)).to.eql([1, -0, -2, -3])
  })

  it('sorts ascending when it is opponents turn', () => {
    var moves = movesWithScores([-1,0,2,3], -1)
    var context = {
      depth: 0,
      turn: 1,
      player: -1
    }
    var sortedMoves = search.sortMoves({context: context, moves: moves})
    expect(sortedMoves.map(m => m.staticEval.absScore)).to.eql([-3, -2, -0, 1])
  })
})

function movesWithScores (scores, player) {
  return scores.reduce((moves, score) => {
    moves.push({
      staticEval: {
        score: score,
        absScore: score * player
      }
    })
    return moves
  }, [])
}
