// http://www.ficsgames.org/download.html
var Brain = require('./brain')
var brain = new Brain()

module.exports = {
  Spoc: Spoc
}

function Spoc () {
  return {
    getNextMove: function (options) {
      var game = brain.getGame(options)
      return brain.getNextMove({game: game})
    }
  }
}


