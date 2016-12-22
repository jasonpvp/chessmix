var path = require('path')
var exec = require('child_process').exec
var spawn = require('child_process').spawn

const commandLineArgs = require('command-line-args')
const optionDefinitions = [
  {name: 'engine', alias: 'e', type: String}
]

const options = commandLineArgs(optionDefinitions)
const trainer = path.join(__dirname, 'src', 'engine', options.engine, 'train.js')
const args = [trainer ]
console.log('run: node ' + args.join(' '))
run ('node', args, data => process.stdout.write(data))

function run(cmd, args, callback) {
  var command = spawn(cmd, args)
  command.stdout.on('data', function(data) {
    callback(data.toString())
  })
}

