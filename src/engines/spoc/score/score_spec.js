import { expect } from 'chai'
var Chess = require('chess.js')//.Chess
var board = new Chess()
var Score = require('./score')

describe('score', () => {
  var scoreConfig
  var score
  beforeEach(() => {
    scoreConfig = {
      onStaticScore: sinon.spy(),
      onPredictedScore: sinon.spy()
    }
    score = new Score(scoreConfig)
  })

  describe('staticScore', () => {
    it('returns the cardinal score of the board', () => {
      board.remove('d1')
      var staticScore = score.staticScore({board: board})
      expect(staticScore).to.eql(-10)
    })

    it('calls the onStaticScore callback', () => {
      score.staticScore({board: board})
      expect(scoreConfig.onStaticScore.callCount).to.eql(1)
    })
  })

  describe('predictedScore', () => {
    it('returns the predicted score', () => {
      var nextMoves = [
        {staticScore: 1},
        {predictedScore: 2},
        {predictedScore: 3}
      ]
      var depth = 4
      var predictedScore = score.predictedScore({
        context: {depth: depth},
        nextMoves: nextMoves
      })
      expect(predictedScore).to.eql((1/depth + 2/depth + 3/depth) / 3)
    })

    it('calls the onPredictedScore callback', () => {
      var nextMoves = [
        {staticScore: 1}
      ]
      score.predictedScore({
        context: {depth: 0},
        nextMoves: nextMoves
      })

      expect(scoreConfig.onPredictedScore.callCount).to.eql(1)
    })
  })
})
