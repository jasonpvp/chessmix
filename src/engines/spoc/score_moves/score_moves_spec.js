import { expect } from 'chai'
import ScoreMoves from './score_moves'

describe('scoreMoves', () => {
  var context, evaluate, search
  beforeEach(() => {
    context = mockContext()
    evaluate = mockEvaluate()
    search = mockSearch()
  })

  it('gets moves to score', () => {
    sinon.stub(context.board, 'moves').returns([])
    ScoreMoves({context: context, evaluate: evaluate, search: search})
    expect(context.board.moves.called).to.be.true
  })

  it('returns move objects', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    var moves = ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(moves[0]).to.eql({
      verboseMove: {from: 'a2', to: 'a3'},
      simpleMove: 'a2a3',
      staticEval: {score: 0},
      predictiveEval: {score: 0},
      nextMoves: [],
      prevMove: null,
      depth: 0,
      path: ':a2a3'
    })
  })

  it('returns moves sorted by score', () => {
    evaluate.staticEval = options => options.move
    search.sortMoves = options => {
      return options.moves.sort((a, b) => a.staticEval.score < b.staticEval.score ? 1 : (a.staticEval.score > b.staticEval.score ? -1 : 0))
    }
    context.haltSearch = () => true

    context.moves = [
      {staticEval: {score: 10}},
      {staticEval: {score: 20}},
      {staticEval: {score: 15}},
    ]

    var moves = ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(moves.map(m => m.staticEval.score)).to.eql([20, 15, 10])
  })

  it('statically evaluate moves', () => {
    sinon.stub(evaluate, 'staticEval').returns({score: 100})
    sinon.stub(context.board, 'moves').returns([
      {from: 'a2', to: 'a3'}
    ])
    var moves = ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(moves[0].staticEval).to.eql({score: 100})
  })

  it('searches next moves, but avoids infinite recursion', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.callCount).to.eql(201)
    expect(search.scoreNextMoves.lastCall.args[0].context.depth).to.eql(200)
  })

  it('limits recursion', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    context.maxDepth = 10
    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.callCount).to.eql(11)
    expect(search.scoreNextMoves.lastCall.args[0].context.depth).to.eql(10)
  })

  it('returns scored moves without searching next moves when search says to', () => {
    sinon.stub(search, 'scoreNextMoves').returns(false)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(search.scoreNextMoves.callCount).to.eql(1)
  })

  it('searches next moves until there are no more', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(search.scoreNextMoves.callCount).to.eql(2)
  })

  it('searches next moves until the search is halted', () => {
    sinon.stub(context, 'haltSearch').returns(true)
    sinon.stub(context.board, 'moves').returns([{from: 'a2', to: 'a3'}])
    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(context.board.moves.callCount).to.eql(1)
  })

  it('passes the next context on next move search', () => {
    sinon.stub(search, 'scoreNextMoves').returns(true)
    context.board.moves = () => [{from: 'a2', to: 'a3'}]
    // recurse one level
    context.board.move = () => {
      context.board.moves = () => []
    }
    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(search.scoreNextMoves.firstCall.args[0].context.depth).to.eql(0)
    expect(search.scoreNextMoves.firstCall.args[0].context.turn).to.eql(1)

    expect(search.scoreNextMoves.secondCall.args[0].context.depth).to.eql(1)
    expect(search.scoreNextMoves.secondCall.args[0].context.turn).to.eql(-1)
  })

  it('evaluates moves based on their nextMoves evaluations', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      [{from: 'a4', to: 'a5'}, {from: 'a4', to: 'b5'}],
      [],
      []
    ]
    context.board.moves = () => movePath.shift()

    // simply return the move as the score to make it easy to validate predicted score
    evaluate.staticEval = options => ({score: options.move.simpleMove})
    evaluate.predictiveEval = options => {
      var score = options.move.staticEval.score + ':' + options.nextMoves.map(m => m.predictiveEval.score).join('+')
      return {score: score}
    }

    var moves = ScoreMoves({context, context, evaluate: evaluate, search: search})
console.log(moves[0])
    expect(moves[0].predictiveEval.score).to.eql('a2a3:a3a4:a4a5:+a4b5:')
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

    ScoreMoves({context, context, evaluate: evaluate, search: search})
    expect(context.board.move.callCount).to.eql(context.board.undo.callCount)
  })

  it('sets the nextMoves for a move', () => {
    var movePath = [
      [{from: 'a2', to: 'a3'}],
      [{from: 'a3', to: 'a4'}],
      []
    ]
    context.board.moves = () => movePath.shift()

    var moves = ScoreMoves({context, context, evaluate: evaluate, search: search})
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
    ScoreMoves({context, context, evaluate: evaluate, search: search})

    expect(search.scoreNextMoves.secondCall.args[0].context.prevMove.simpleMove).to.eql('a2a3')
  })
})

function mockContext () {
  return {
    board: mockBoard(),
    player: 1,
    moves: null,
    prevMove: null,
    haltSearch: () => false,
    onSearchComplete: () => {},
    depth: 0,
    turn: 1
  }
}

function mockBoard () {
  return {
    moves: () => [],
    move: () => null,
    undo: () => null,
    ascii: () => ''
  }
}

function mockEvaluate () {
  return {
    staticEval: () => ({score: 0}),
    predictiveEval: () => ({score: 0})
  }
}

function mockSearch () {
  return {
    scoreNextMoves: () => true,
    sortMoves: options => options.moves
  }
}
