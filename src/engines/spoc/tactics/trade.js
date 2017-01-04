/*
*   trade is when two successive moves each result in a capture
*   trade looks at two successive moves
*/

module.exports = function trade (options) {
  var isTrade = options.move0.verboseMove.captured && options.move1.verboseMove.captured

  return {
    isTrade: isTrade
  }
}
