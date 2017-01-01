// http://www.ficsgames.org/download.html
var Brain = require('./brain')
var GameStore = require('../../game_store')
var gameStore = new GameStore()

module.exports = Spoc

function Spoc () {
  return {
    getNextMove: function (options) {
      var gameOptions = {
        gameId: options.gameId,
        player: options.player
      }

      var game = gameStore.findGame(gameOptions)
      if (!game) {
        options.engine = new Brain(options)
        game = gameStore.newGame(options)
      }

      return game.engine.getNextMove({game: game, fen: options.fen, moves: options.moves}).then(function (nextMove) {
        nextMove.gameId = game.gameId
        nextMove.player = game.player
        return nextMove
      })
    }
  }
}


