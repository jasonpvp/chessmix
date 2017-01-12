use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in &[-1, 1] {
    for j in &[-1, 1] {
      let ii = cell[0] as i32 + i;
      let jj = cell[1] as i32 + j;
      if ii >= 0 && ii <= 7 && jj >= 0 && jj <= 8 {
        moves.push(get_move(board, piece_value, [ii as usize, jj as usize]));
      }
    }
  }
  moves
}

fn get_move(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> chess::Move {
  let i = cell[0];
  let j = cell[1];
  let occupied = board.cells[i][j] != 0;
  let other = chess::pieces::comp::same_color(piece_value, board.cells[i][j]);
  chess::Move {
    from_cell: cell,
    to_cell: [i, j],
    piece_value: piece_value,
    valid: other || !occupied
  }
}
