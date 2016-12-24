var cardinalScore = require('./cardinal_score').cardinalScore

module.exports = function (config) {
  return {
    staticScore: function (options) {
      return scoreWithCallback(staticScore, options, config.onStaticScore)
    },
    predictedScore: function (options) {
      return scoreWithCallback(predictedScore, options, config.onPredictedScore)
    }
  }
}

function scoreWithCallback (scoreFunction, options, callback) {
  var s = scoreFunction(options)
  callback({score: s, options: options})
  return s
}

function staticScore (options) {
  var boardArray = asciiBoardToArray(options.board.ascii())
  return cardinalScore({boardArray: boardArray})
}

function predictedScore (options) {
  return options.nextMoves.reduce(function (score, move) {
    var moveScore = (parseInt(move.predictedScore, 10) === move.predictedScore) ? move.predictedScore : move.staticScore
    return score + moveScore / (options.context.depth || 1)
  }, 0) / options.nextMoves.length
}

// Convert an ascii board into a nested array
function asciiBoardToArray (ascii) {
  var rows = ascii.split(/\n/)
  var boardArray = rows.reduce(function (boardArray, row) {
    if (row.indexOf('-') > -1 || row.indexOf('h') > -1) return boardArray
    var rowArray = row.slice(5, 27).split(/\ +/)
    boardArray.push(rowArray)
    return boardArray
  }, [])
  return boardArray
}
