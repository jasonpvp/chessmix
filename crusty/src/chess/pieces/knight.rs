use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in &[-1, 1] {
    for j in &[-1, 1] {
      moves.push(get_move(board, piece_value, cell, [*i, *j]));
    }
  }
  moves
}

fn get_move(board: &chess::Board, piece_value: i32, cell: [usize; 2], offset: [i32; 2]) -> chess::Move {
  let i = cell[0] + offset[0] as usize;
  let j = cell[1] + offset[1] as usize;
  let occupied = board.cells[i][j] != 0;
  let other = chess::pieces::comp::same_color(piece_value, board.cells[i][j]);
  chess::Move {
    from_cell: cell,
    to_cell: [i, j],
    piece_value: piece_value,
    valid: other || !occupied
  }
}
