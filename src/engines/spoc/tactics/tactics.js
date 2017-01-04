/*
*   Tactics are used to evaluate a series of moves.
*   A tactical evaluation does not consider who the tactic benefits.
*   It simply determines whether a series of moves matches a pattern.
*   This allows higher-order analysis to consider which move opponent might make
*
*   A tactical evaluation returns:
*     whether the series of moves is an example of that tactic
*
*   A move series has multiple tactical evaluations
*
*   Since a move has multiple nextMove options, moves can also have
*   tactical evaluations based on the tactical evaluations of multiple nextMoves
*   For example, a move that can be followed by a capture or a trade is a fork.
*/

module.exports = {
  isSafeCapture: require('./safe_capture'),
  isSacrifice: require('./sacrifice'),
  isTrade: require('./trade')
}
