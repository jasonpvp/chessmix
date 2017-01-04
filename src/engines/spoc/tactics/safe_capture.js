/*
*   safeCapture is when a capture is followed by a non-capture
*   safeCapture looks at two sucessive moves
*/

module.exports = function safeCapture (options) {
  var isSafeCapture = options.move0.verboseMove.captured && !options.move1.verboseMove.captured

  return {
    isSafeCapture: isSafeCapture
  }
}
