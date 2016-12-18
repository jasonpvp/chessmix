import Chess from 'chess.js'
import { ChessBrain, boardToBinary, moveToBinary } from './chess_brain'

export function Chesster (board, moveCallback) {
  const brain = new ChessBrain()

  return {
    makeMove: (moves) => {
      const nextMove = brain.getBestMove(board, board.moves({verbose: true}))
      console.log(nextMove.move.piece + nextMove.move.from + nextMove.move.to + ' score: ' + nextMove.score)
      moveCallback(nextMove.move.piece, nextMove.move.from, nextMove.move.to, nextMove.move.promotion)
    },
    brain
  }
}

