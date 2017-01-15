use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in &[-1, 1] {
    for j in &[-1, 1] {
      let ii = cell[0] as i32 + i * 2;
      let jj = cell[1] as i32 + j;
      if ii >= 0 && ii <= 7 && jj >= 0 && jj <= 7 {
        moves.push(get_move(board, piece_value, piece_turn, cell, [ii as usize, jj as usize]));
      }
      let ii = cell[0] as i32 + i;
      let jj = cell[1] as i32 + j * 2;
      if ii >= 0 && ii <= 7 && jj >= 0 && jj <= 7 {
        moves.push(get_move(board, piece_value, piece_turn, cell, [ii as usize, jj as usize]));
      }
    }
  }
  moves
}

fn get_move(board: &chess::Board, piece_value: i32, piece_turn: bool, from_cell: [usize; 2], to_cell: [usize; 2]) -> chess::Move {
  let i = to_cell[0];
  let j = to_cell[1];
  let occupied = board.cells[i][j] != 0;
  let other = !chess::pieces::comp::same_color(piece_value, board.cells[i][j]);
  let capture = occupied && other;
  chess::Move {
    from_cell: from_cell,
    to_cell: to_cell,
    piece_value: piece_value,
    valid: piece_turn && (other || !occupied),
    capture: capture,
    capture_diff: if capture { (board.cells[i][j]).abs() - piece_value.abs() } else { 0 },
    capture_value: if capture { (board.cells[i][j]).abs() } else { 0 }
  }
}
