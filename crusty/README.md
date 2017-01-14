## Crusty
A chess engine written in Rust

initial state
  - eval (based on pieces and topology)
  - scored-moves
    - scored-move
      - board
      - eval (if leaf, based on pieces and topology, else best eval from next-moves)

get-best-move (board)
  moves = get-moves(board)
  scored-moves = moves.reduce(get-scored-move(board, move))
  return scored-moves.sort()[0]

get-scored-move (board, move)
  new-board = apply-move(board, move)
  if depth === max-depth {
    ScoredMove { score: x }
  } else {
    get-best-move(new-board)
  }

## TODO
See about interfacing with https://www.gnu.org/software/xboard/
