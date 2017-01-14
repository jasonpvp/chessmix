use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in &[-1, 1] {
    for j in &[-1, 1] {
      moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [*i, *j]));
    }
  }
  moves
}
