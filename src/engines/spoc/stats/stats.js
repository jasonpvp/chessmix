module.exports = Stats

function Stats () {
  this.reset()
  return this
}

Stats.statTypes = {
  static: 'static',
  predictive: 'predictive'
}

Stats.prototype.reset = function () {
  Object.assign(this, {
    predictionCount: 0,
    currentDepth: 0,
    levels: [],
    rejectedMoves: []
  })
}

Stats.prototype.setDepth = function (options) {
  console.log('Set pred depth: ' + options.depth)
  this.currentDepth = options.depth
}

Stats.prototype.serialize = function () {
  return {
    predictionCount: this.predictionCount,
    currentDepth: this.currentDepth,
    levels: this.levels
  }
}

Stats.prototype.addStaticStat = function (options) {
  options.type = Stats.statTypes.static
  this.addStat(options)
}

Stats.prototype.addPredictiveStat = function (options) {
  options.type = Stats.statTypes.predictive
  this.addStat(options)
}

Stats.prototype.addStat = function (options) {
  var stats = this
  var type = options.type
  var score = options.score
  var depth = options.depth

  if (!stats.levels[depth]) {
    stats.levels[depth] = {
      depth: depth,
      counts: {
        static: 0,
        predictive: 0
      },
      hist: {
        static: {},
        predictive: {}
      }
    }
  }
  var stat = stats.levels[depth]
  stat.counts[type]++
  var bucket = Math.floor(score)
  stat.hist[type][bucket] = stat.hist[type][bucket] || 0
  stat.hist[type][bucket]++
  if (type === 'predictive' && depth === 0) {
    stats.predictionCount++
  }
}

Stats.prototype.rejectMove = function (options) {
  var eval = options.move.predictiveEval || options.move.staticEval || {path: 'null'}
  this.rejectedMoves.push(eval.path)
}

Stats.prototype.clearPredictions = function (options) {
  console.log('Clear preds after ' + this.currentDepth)
  // remove prediction stats
  this.levels.splice(this.currentDepth)
  this.predictionCount= 0
}
