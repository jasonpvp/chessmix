import { expect } from 'chai'
var Chess = require('chess.js')
var ScoreMoves = require('../score_moves')

describe('analyze', () => {
  var context, evaluate, search
  var board

  beforeEach(function () {
    board = new Chess()
    context = mockContext({board: board})
    evaluate = mockEvaluate()
    search = mockSearch()
  })

  it('finds a mocked fork', () => {
    var nextMoves = [
      [{simpleMove: 'x1b1', recursed: true}],
      [{simpleMove: 'b1c1', recursed: true}],
      [{simpleMove: 'c1e1', captured: 'r'}]
    ]
    board.moves = () => nextMoves.splice(0,1)[0]
    var moves = ScoreMoves({context: context, evaluate: evaluate, search: search})
    expect(moves.filter(move => move.analysis.isFork).length).to.eql(1)
  })

  it('does not flag a mocked non-fork as a fork', () => {
    var nextMoves = [
      [{simpleMove: 'z1b1', recursed: true}],
      [{simpleMove: 'b1c1', recursed: true}],
      [{simpleMove: 'c1e1', captured: undefined}]
    ]
    board.moves = () => nextMoves.splice(0,1)[0]

    var moves = ScoreMoves({context: context, evaluate: evaluate, search: search})
    expect(moves.filter(move => move.analysis.isFork).length).to.eql(0)
  })

  it('finds a fork', function (done) {
    this.timeout(10000)
    // Setup a knight fork
    board.load('4k3/3r4/b7/8/8/1N6/3PP3/4K3 w KQkq - 0 50')
    console.log(board.ascii())
    var moves = ScoreMoves({context: context, evaluate: evaluate, search: search})
    expect(moves.filter(move => move.analysis.isFork).length).to.eql(1)
    expect(moves.find(move => move.simpleMove === 'b3c5').analysis.isFork).to.eql.true
    done()
  })

  it('does not find a fork when the forker can be captured', function (done) {
    this.timeout(10000)
    // Setup a knight fork
    board.load('4k3/3r4/bp6/8/8/1N6/3PP3/4K3 w KQkq - 0 50')
    console.log(board.ascii())
    var moves = ScoreMoves({context: context, evaluate: evaluate, search: search})
    expect(moves.filter(move => move.analysis.isFork).length).to.eql(0)
    done()
  })
})

function setupForks (board) {
  expect(board.turn()).to.eql('w')
}

function applyMoves (options) {
  var moves = options.moves || []
  var board = options.board || new Chess()
  for (var i = 0; i < moves.length; i++) {
    board.move(moves[i], {sloppy: true})
  }
  return board
}

function mockContext (options) {
  return {
    board: options.board,
    player: 1,
    turn: 1,
    moves: null,
    prevMove: null,
    haltSearch: () => false,
    onSearchComplete: () => {},
    depth: 0,
    maxDepth: 1
  }
}

function mockEvaluate () {
  return {
    staticEval: () => ({absScore: 0, absDelta: 0}),
    predictiveEval: () => ({absScore: 0, absDelta: 0})
  }
}

function mockSearch () {
  return {
    scoreNextMoves: () => true,
    sortMoves: options => options.moves
  }
}
