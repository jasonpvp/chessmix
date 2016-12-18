var Chesster = require('./chesster').Chesster
var Chess = require('chess.js').Chess
var newGame = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

var board = new Chess()
var players = {
  b: new Chesster(),
  w: white = new Chesster()
}

console.log('Start training Chesster...')
var iter = 1
while (true) {
  trainGame()
  iter--
}
process.exit()

function trainGame () {
  board.load(newGame)
  var moveCount = 0
  var moves = {
    all: [],
    b: [],
    w: []
  }
  var playing = true
  var lastTurn

  while (playing && moveCount < 200 && board.moves().length > 0) {
    var turn = board.turn()
    var move = players[turn].getNextMove({moves: moves.all})
    if (board.in_stalemate()) {
      playing = false
    } else {
      process.stdout.write(move.nextMove + '(' + move.index + '/' + board.moves().length + '=' + move.score.toFixed(2) + ') ')
      board.move(move.nextMove, {sloppy: true})
      moves.all.push(move.nextMove)
      moves[turn].push(move.nextMove)
      moveCount++
      lastTurn = turn
    }
  }
  var winner = '-'
  if (!board.in_checkmate()) {
    console.log('Draw!')
  } else {
    console.log('Winner: ' + lastTurn)
    winner = lastTurn
  }
  const trainingOptions = {
    board: board,
    moves: moves.all,
    winner: winner,
    rate: 0.05
  }
  console.log(board.ascii())
  trainPlayer('b', trainingOptions)
//  trainPlayer('w', trainingOptions)
}

function trainPlayer (player, options) {
  if (options.winner === player) {
    options.score = 1
  } else if (options.winner === '-') {
    options.score = 0.35
  } else {
    options.score = 0
  }
  console.log('Train ' + player + ' with score: ' + options.score + ', rate: ' + options.rate)
  players[player].train(options)
}
