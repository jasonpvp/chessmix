use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [1, 0]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [-1, 0]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [0, 1]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [0, -1]));
  moves
}
