// A cleaned up version of the stockfish node example:
// https://github.com/nmrugg/stockfish.js/blob/master/example/simple_node.js

const commandLineArgs = require('command-line-args')
const stockfish = require("stockfish")
const engine = stockfish()
var position = "startpos"
var got_uci
var started_thinking

// TODO: add more UCI command options: http://wbec-ridderkerk.nl/html/UCIProtocol.html
const optionDefinitions = [
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'fen', alias: 'f', type: String},
  {name: 'moves', alias: 'm', type: String},
  {name: 'movetime', alias: 't', type: Number, defaultOption: 10}
]

const options = commandLineArgs(optionDefinitions)

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
  console.log("Sending: " + str)
  engine.postMessage(str)
}

console.log('Position: ' + position)
send("uci")


function processMessage (line) {
  var match
  console.log("Line: " + line)

  if (typeof line !== "string") {
    console.log("Got line:")
    console.log(typeof line)
    console.log(line)
    return
  }

  if (!got_uci && line === "uciok") {
    got_uci = true
    console.log('setup new game')
    if (position) {
      send("position " + position)
      send("eval")
      send("d")
    }
    console.log('go ponder')
    send("go ponder")
  } else if (!started_thinking && line.indexOf("info depth") > -1) {
    console.log("Thinking...")
    started_thinking = true
    setTimeout(function () {
      send("stop")
    }, 1000 * options.movetime)
  } else if (line.indexOf("bestmove") > -1) {
    match = line.match(/bestmove\s+(\S+)/)
    if (match) {
      console.log("Best move: " + match[1])
      process.exit()
    }
  }
}

function printHelp () {
  console.log("Usage: node trainer.js [--fen FEN-string] [--moves \"move move move\"] [--movetime seconds]")
  console.log("")
  console.log("Examples:")
  console.log("   node trainer.js")
  console.log("   node trainer.js -f \"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2\"")
  console.log("   node trainer.js -m \"g1f3 e7e\"")
  console.log("   node trainer.js -t 10")
}
