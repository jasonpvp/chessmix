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
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(0)
      expect(staticEval.absScore).to.eql(-0) // cause player is -1 and 0 * -1 === -0 :)
    })

    it('scores a good board for black', () => {
      board.remove('d1')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(-10)
      expect(staticEval.absScore).to.eql(10)
    })

    it('scores a good board for white', () => {
      context.game.player = 1
      board.remove('d8')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(10)
      expect(staticEval.absScore).to.eql(10)
    })

    it('scores a bad board for black', () => {
      board.remove('d8')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(10)
      expect(staticEval.absScore).to.eql(-10)
    })

    it('scores a bad board for white', () => {
      context.game.player = 1
      board.remove('d1')
      var staticEval = evaluate.staticEval({context: context})
      expect(staticEval.score).to.eql(-10)
      expect(staticEval.absScore).to.eql(-10)
    })

    it('calls the onStaticEval callback', () => {
      evaluate.staticEval({context: context})
      expect(evalConfig.onStaticEval.callCount).to.eql(1)
    })
  })

  describe('predictiveEval', () => {
    it('returns a good predictive eval', () => {
      var nextMoves = [
        {staticEval: {absScore: 1}},
        {staticEval: {absScore: 2}},
        {staticEval: {absScore: 3}}
      ]
      var depth = 4
      context.depth = depth
      var predictiveEval = evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })
      var expectedScore = (1/depth + 2/depth + 3/depth) / 3
      expect(predictiveEval.absScore).to.eql(expectedScore)
      expect(predictiveEval.score).to.eql(expectedScore * context.game.player)
    })

    it('returns a bad eval', () => {
      var nextMoves = [
        {staticEval: {absScore: -1}},
        {staticEval: {absScore: -2}},
        {staticEval: {absScore: -3}}
      ]
      var depth = 4
      context.depth = depth
      var predictiveEval = evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })
      var expectedScore = (-1/depth + -2/depth + -3/depth) / 3
      expect(predictiveEval.absScore).to.eql(expectedScore)
      expect(predictiveEval.score).to.eql(expectedScore * context.game.player)
    })

    it('returns a neutral eval', () => {
      var nextMoves = [
        {staticEval: {absScore: -1}},
        {staticEval: {absScore: -2}},
        {staticEval: {absScore: 3}}
      ]
      var depth = 4
      context.depth = depth
      var predictiveEval = evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })
      expect(predictiveEval.absScore).to.eql(0)
      expect(predictiveEval.score).to.eql(0 * context.game.player)
    })

    it('is based on predictive evals when provided', () => {
      var nextMoves = [
        {predictiveEval: {absScore: -0.5}, staticEval: {absScore: -1}},
        {predictiveEval: {absScore: -1}, staticEval: {absScore: -2}},
        {staticEval: {absScore: 3}}
      ]
      var depth = 4
      context.depth = depth
      var predictiveEval = evaluate.predictiveEval({
        context: context,
        nextMoves: nextMoves
      })
      var expectedScore = (-0.5/depth + -1/depth + 3/depth) / 3
      expect(predictiveEval.score).to.eql(expectedScore * context.game.player)
      expect(predictiveEval.absScore).to.eql(expectedScore)

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
