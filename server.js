var express = require('express')
var app = express()
var Chesster = require('./src/server/chesster').Chesster
var chesster = new Chesster()

var sys = require('sys')
var exec = require('child_process').exec;
var path = require('path')
var trainer = path.join(__dirname, 'src', 'server', 'trainer.js')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.get('/getMove', function (req, res) {
  if (req.query.engine === 'stockfish') {
    sendStockfishMove(req, res)
  } else if (req.query.engine === 'chesster') {
    var move = chesster.getNextMove({fen: req.query.fen, moves: req.query.moves.split(' ')})
    console.log('Chesster move: ' + JSON.stringify(move))
    res.send(move)
  }
})

function sendStockfishMove (req, res) {
  var cmd = ['node ' + trainer]
  if (req.query.fen) cmd.push.apply(cmd, ['-f', req.query.fen])
  if (req.query.moves) cmd.push.apply(cmd, ['-m', '"' + req.query.moves + '"'])
  if (req.query.movetime !== undefined) cmd.push.apply(cmd, ['-t', req.query.movetime])

  console.log('query: ' + JSON.stringify(req.query))
  console.log('cmd: ' + cmd.join(' '))
  exec(cmd.join(' '), (err, stdout, stderr) => {
    var lines = stdout.split(/\n/)
    console.log(lines)
    var result = lines[lines.length - 2]
    console.log('send result: ' + result)
    res.send(result)
  })
}

app.listen(3000, function () {
  console.log('Chesster running on port 3000!')
})
