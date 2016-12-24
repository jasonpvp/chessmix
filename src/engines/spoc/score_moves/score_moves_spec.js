import { expect } from 'chai'
import sinon from sinon
import { scoreMoves } from './score_moves'

describe('scoreMoves', () => {
  it('gets moves to score', () => {
    var context = mockContext()
    sinon.stub(context, 'moves')
    scoreMoves({context: context, score: mockScore(), search: mockSearch()})
debugger
    expect(context.moves)
  })
})

function mockContext () {
  return {
    board: mockBoard(),
    haltSearch: () => false,
    depth: 0,
    turn: 1,
    player: 1,
    currentScore: 0
  }
}

function mockBoard () {
  return {
    moves: () => [],
    move: () => null,
    undo: () => null
  }
}

function mockScore () {
  return {
    boardScore: () => 0,
    moveScore: () => 0
  }
}

function mockSearch () {
  return {
    scoreNextMoves: () => false,
    sortMoves: moves => moves
  }
}
