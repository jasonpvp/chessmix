use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  moves.extend(chess::pieces::rook::get_moves(board, piece_value, cell));
  moves.extend(chess::pieces::bishop::get_moves(board, piece_value, cell));
  moves
}
