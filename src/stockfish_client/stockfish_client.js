export function StockfishClient (board, moveCallback) {
  return {
    makeMove: (moves) => {
      fetch('http://localhost:3000/getTrainerMove?movetime=0&moves=' + moves.join(' ')).then(response => {
        return response.json()
      }).then(data => {
        console.log(data)
        console.log(`trainer response: ${JSON.stringify(data)}`)
        const move = data.bestMove
        const from = move.slice(0, 2)
        const to = move.slice(2, 4)
        const promotion = move.slice(4, 5)
        const nextMove = {
          piece: board.get(from).type,
          from,
          to,
          promotion
        }
        moveCallback(nextMove.piece, nextMove.from, nextMove.to, nextMove.promotion)
      })
    }
  }
}
