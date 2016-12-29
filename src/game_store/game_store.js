module.exports = GameStore

function GameStore () {
  var games = {}
  Object.assign(this, {
    findGame: function (options) {
      return games[gameId(options)]
    },
    newGame: function (options) {
      var game = new Game(options)
      games[gameId(game)] = game
    }
  })
}

function gameId (options) {
  return options.gameId + ':' + options.player
}

function Game (options) {
  return {
    gameId: options.gameId,
    player: parseInt(options.player, 10),
    engine: options.engine
  }
}


