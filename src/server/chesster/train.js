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
while (iter > 0) {
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

  while (playing && moveCount < 100 && board.moves().length > 0) {
    var turn = board.turn()
    var move = players[turn].getNextMove({moves: moves.all})
    if (board.game_over()) {
      playing = false
    } else {
      board.move(move.nextMove, {sloppy: true})
      moves.all.push(move.nextMove)
      moves[turn].push(move.nextMove)
      process.stdout.write(move.nextMove + ' ')
      moveCount++
      lastTurn = turn
    }
  }
  if (board.in_stalemate() || board.in_draw()) {
    console.log('Draw!')
  } else {
    console.log('Winner: ' + lastTurn)
  }
  const trainingOptions = {
    board: board,
    moves: moves.all,
    score: 0,
    rate: 0.8
  }
  console.log(board.ascii())
  console.log('Train black with score: ' + trainingOptions.score + ', rate: ' + trainingOptions.rate + ', moves: ' + JSON.stringify(trainingOptions.moves))
  players.b.train(trainingOptions)
}
