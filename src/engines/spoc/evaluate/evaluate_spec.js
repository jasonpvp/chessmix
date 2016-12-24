import { expect } from 'chai'
var Chess = require('chess.js')//.Chess
var board = new Chess()
var Evaluate = require('./evaluate')

describe('evaluate', () => {
  var evalConfig
  var evaluate
  var context
  beforeEach(() => {
    board.reset()
    evalConfig = {
      onStaticEval: sinon.spy(),
      onPredictiveEval: sinon.spy()
    }
    evaluate = new Evaluate(evalConfig)
    context = {
      game: {
        player: -1,
        board: board
      }
    }
  })

  describe('staticEval', () => {
    it('returns the score of the board', () => {
      board.remove('d1')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(-10)
    })

    it('returns the absScore of the board', () => {
      board.remove('d1')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.absScore).to.eql(10)
    })

    it('calls the onStaticEval callback', () => {
      evaluate.staticEval({context: context})
      expect(evalConfig.onStaticEval.callCount).to.eql(1)
    })
  })

  describe('predictiveEval', () => {
    it('returns the predictive evaluatation', () => {
      var nextMoves = [
        {staticEval: {score: 1}},
        {predictiveEval: {score: 2}},
        {predictiveEval: {score: 3}}
      ]
      var depth = 4
      context.depth = depth
      var predictiveEval = evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })
      expect(predictiveEval.score).to.eql((1/depth + 2/depth + 3/depth) / 3)
    })

    it('calls the onPredictiveEval callback', () => {
      var nextMoves = [
        {staticEval: 1}
      ]
      context.depth = 0
      evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })

      expect(evalConfig.onPredictiveEval.callCount).to.eql(1)
    })
  })
})
