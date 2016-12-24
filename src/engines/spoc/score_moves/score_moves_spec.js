import { expect } from 'chai'
//var sinon = require('sinon')
import { scoreMoves } from './score_moves'

describe('scoreMoves', () => {
  var context, score, search
  beforeEach(() => {
    context = mockContext()
    score = mockScore()
    search = mockSearch()
  })

  it('gets moves to score', () => {
    sinon.stub(context.board, 'moves').returns([])
    scoreMoves({context: context, score: score, search: search})
    expect(context.board.moves.called).to.be.true
  })

  it('returns move objects', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    var moves = scoreMoves({context, context, score: score, search: search})
    expect(moves[0]).to.eql({
      verboseMove: {from: 'a2', to: 'a3'},
      simpleMove: 'a2a3',
      staticScore: 0,
      predictedScore: 0,
      nextMoves: []
    })
  })

  it('returns moves sorted by score', () => {
    score.staticScore = options => options.move
    search.sortMoves = options => {
      return options.moves.sort((a, b) => a.score < b.score ? 1 : (a.score > b.score ? -1 : 0))
    }

    context.moves = [
      {score: 10},
      {score: 20},
      {score: 15}
    ]

    var moves = scoreMoves({context, context, score: score, search: search})
    expect(moves.map(m => m.score)).to.eql([20, 15, 10])
  })

  it('statically scores moves', () => {
    sinon.stub(score, 'staticScore').returns(100)
    sinon.stub(context.board, 'moves').returns([
      {from: 'a2', to: 'a3'}
    ])
    var moves = scoreMoves({context, context, score: score, search: search})
    expect(moves[0].staticScore).to.equal(100)
  })

  it('searches next moves, but avoids infinite recursion', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    scoreMoves({context, context, score: score, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.callCount).to.eql(201)
    expect(search.scoreNextMoves.lastCall.args[0].context.depth).to.eql(200)
  })

  it('limits recursion', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    context.maxDepth = 10
    scoreMoves({context, context, score: score, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.callCount).to.eql(11)
    expect(search.scoreNextMoves.lastCall.args[0].context.depth).to.eql(10)
  })

  it('returns scored moves without searching next moves when search says to', () => {
    sinon.stub(search, 'scoreNextMoves').returns(false)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    scoreMoves({context, context, score: score, search: search})
    expect(search.scoreNextMoves.callCount).to.eql(1)
  })

  it('searches next moves until there are no more', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    scoreMoves({context, context, score: score, search: search})
    expect(search.scoreNextMoves.callCount).to.eql(2)
  })

  it('searches next moves until the search is halted', () => {
    sinon.stub(context, 'haltSearch').returns(true)
    sinon.stub(context.board, 'moves').returns([{from: 'a2', to: 'a3'}])
    scoreMoves({context, context, score: score, search: search})
    expect(context.board.moves.callCount).to.eql(1)
  })

  it('passes the next context on next move search', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    // recurse one level
    context.board.move = () => {
      context.board.moves = () => []
    }
    scoreMoves({context, context, score: score, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.secondCall.args[0].context.depth).to.eql(1)
  })

  it('scores moves based on their nextMoves scores', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      [{from: 'a4', to: 'a5'}, {from: 'a4', to: 'b5'}],
      [],
      []
    ]
    context.board.moves = () => movePath.shift()

    // simply return the move as the score to make it easy to validate predicted score
    score.staticScore = options => options.move.simpleMove
    score.predictedScore = options => {
      return options.move.staticScore + ':' + options.nextMoves.map(m => m.predictedScore).join('+')
    }

    var moves = scoreMoves({context, context, score: score, search: search})
    expect(moves[0].predictedScore).to.eql('a2a3:a3a4:a4a5:+a4b5:')
  })

  it('resets the board after each recursion', () => {
    sinon.stub(context.board, 'move')
    sinon.stub(context.board, 'undo')

    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      [{from: 'a4', to: 'a5'}, {from: 'a4', to: 'b5'}],
      [],
      []
    ]
    context.board.moves = () => movePath.shift()

    scoreMoves({context, context, score: score, search: search})
    expect(context.board.move.callCount).to.eql(4)
    expect(context.board.undo.callCount).to.eql(4)
  })

  it('sets the nextMoves for a move', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    var moves = scoreMoves({context, context, score: score, search: search})
    expect(moves[0].nextMoves[0].simpleMove).to.eql('a3a4')
  })

  it('passes the previous move with the context', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      []
    ]
    context.board.moves = () => movePath.shift()
    scoreMoves({context, context, score: score, search: search})

    expect(search.scoreNextMoves.secondCall.args[0].context.prevMove.simpleMove).to.eql('a2a3')
  })
})

function mockContext () {
  return {
    board: mockBoard(),
    moves: null,
    prevMove: null,
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
    staticScore: () => 0,
    predictedScore: () => 0
  }
}

function mockSearch () {
  return {
    scoreNextMoves: () => true,
    sortMoves: options => options.moves
  }
}
