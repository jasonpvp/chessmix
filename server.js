var express = require('express')
var app = express()
var sys = require('sys')
var exec = require('child_process').exec;
var path = require('path')
var trainer = path.join(__dirname, 'src', 'server', 'trainer.js')

function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("ls -la", puts);

app.get('/getBestMove', function (req, res) {
  var cmd = ['node ' + trainer]
  if (req.query.fen) cmd.push(' -f ' + req.query.fen)
  if (req.query.moves) cmd.push(' -m "' + req.query.moves + '"')
  if (req.query.movetime) cmd.push(' -t ' + req.query.movetime)
  console.log('query: ' + JSON.stringify(req.query))
  console.log('cmd: ' + cmd.join(' '))
  exec(cmd, (err, stdout, stderr) => {
    var lines = stdout.split(/\n/)
    var result = lines[lines.length - 2]
    console.log(lines)
    res.send(result)
  })
})

app.listen(3000, function () {
  console.log('Chesster running on port 3000!')
})
