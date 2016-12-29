module.exports = Logger

function Logger (options) {
  this.logLevel = options.logLevel || LOG_LEVEL.error
}

Logger.LOG_LEVEL = Logger.prototype.LOG_LEVEL = {
  error: 1,
  info: 2,
  verbose: 3,
  debug: 4
}

Logger.prototype.logError = function (msg) {
  this.log({level: this.LOG_LEVEL.error, msg: msg})
}

Logger.prototype.logInfo = function (msg) {
  this.log({level: this.LOG_LEVEL.info, msg: msg})
}

Logger.prototype.logVerbose = function (msg) {
  this.log({level: this.LOG_LEVEL.verbose, msg: msg})
}

Logger.prototype.logDebug = function (msg) {
  this.log({level: this.LOG_LEVEL.debug, msg: msg})
}

Logger.prototype.log = function (options) {
  (this.logLevel >= options.level) && console.log(options.msg)
}
