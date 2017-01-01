/*
*   sacrifice is when a non-captuve move is followed by a capture
*   sacrifice looks at two successive moves
*/

module.exports = function sacrifice (options) {
  var isSacrifice = !options.move0.verboseMove.captured && options.move1.verboseMove.captured

  return {
    isSacrifice: isSacrifice
  }
}
