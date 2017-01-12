use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in &[-1, 1] {
    for j in &[-1, 1] {
      moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, cell, [*i, *j]));
    }
  }
  moves
}
