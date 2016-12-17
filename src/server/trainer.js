// A cleaned up version of the stockfish node example:
// https://github.com/nmrugg/stockfish.js/blob/master/example/simple_node.js

const commandLineArgs = require('command-line-args')
const stockfish = require("stockfish")
const engine = stockfish()
var position = "startpos"
var got_uci
var started_thinking
var startTime = (new Date()).getTime()
var duration

// TODO: add more UCI command options: http://wbec-ridderkerk.nl/html/UCIProtocol.html
const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'fen', alias: 'f', type: String},
  {name: 'moves', alias: 'm', type: String},
  {name: 'movetime', alias: 't', type: Number},
  {name: 'verbose', alias: 'v', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)
options.movetime = options.movetime || 1

logIfVerbose('options: ' + JSON.stringify(options))

if (options.help) {
  printHelp()
  process.exit()
}

if (options.fen) {
  position = 'fen ' + options.fen
}

if (options.moves) {
  position += ' moves ' + options.moves
}

engine.onmessage = processMessage

function send (str) {
  logIfVerbose("Sending: " + str)
  engine.postMessage(str)
}

logIfVerbose('Position: ' + position)
send("uci")


function processMessage (line) {
  var match
  logIfVerbose("Line: " + line)

  if (typeof line !== "string") {
    logIfVerbose("Got line:")
    logIfVerbose(typeof line)
    logIfVerbose(line)
    return
  }

  if (!got_uci && line === "uciok") {
    got_uci = true
    logIfVerbose('setup new game')
    if (position) {
      send("position " + position)
      send("eval")
      send("d")
    }
    logIfVerbose('go ponder')
    send("go ponder")
  } else if (!started_thinking && line.indexOf("info depth") > -1) {
    logIfVerbose("Thinking...")
    started_thinking = true
    setTimeout(function () {
      send("stop")
      duration = ((new Date()).getTime() - startTime) / 1000
    }, 1000 * options.movetime)
  } else if (line.indexOf("bestmove") > -1) {
    match = line.match(/bestmove\s+(\S+)/)
    var output = {
      bestMove: match ? match[1] : 'none',
      duration: duration,
      options: options
    }
    // report output
    console.log(JSON.stringify(output))
    process.exit()
  }
}

function printHelp () {
  logIfVerbose("Usage: node trainer.js [--fen FEN-string] [--moves \"move move move\"] [--movetime seconds] [--verbose]")
  logIfVerbose("")
  logIfVerbose("Examples:")
  logIfVerbose("   node trainer.js")
  logIfVerbose("   node trainer.js -f \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"")
  logIfVerbose("   node trainer.js -m \"g1f3 e7e\"")
  logIfVerbose("   node trainer.js -t 10")
}

function logIfVerbose (msg) {
  if (options.verbose) console.log(msg)
}
