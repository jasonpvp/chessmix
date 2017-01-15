use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  let dir = pawn_dir(piece_value);
  let row = cell[0];
  let next_row = row + dir as usize;
  let col = cell[1];
  // move forward 1 space
  moves.push(get_move(board, piece_value, piece_turn, cell, [next_row, col], false));
  let unmoved = if (row == 1 && dir == 1) || (row == 6 && dir == -1) { true } else { false };
  if unmoved && board.cells[next_row + dir as usize][col] == 0 {
    // move forward 2 spaces
    moves.push(get_move(board, piece_value, piece_turn, cell, [next_row + dir as usize, col], false));
  }
  for i in &[-1, 1] {
    let capture_col = col as i32 + i;
    if capture_col >=0 && capture_col <= 7 {
      // capture piece in next row
      moves.push(get_move(board, piece_value, piece_turn, cell, [next_row, capture_col as usize], true));
    }
  }
  // TODO: implement en passant
  moves
}

fn get_move(board: &chess::Board, piece_value: i32, piece_turn: bool, from_cell: [usize; 2], to_cell: [usize; 2], capture_required: bool) -> chess::Move {
  let i = to_cell[0];
  let j = to_cell[1];
  let occupied = board.cells[i][j] != 0;
  let other = chess::pieces::comp::opposing_pieces(piece_value, board.cells[i][j]);
  let capture = occupied && other;

  chess::Move {
    from_cell: from_cell,
    to_cell: to_cell,
    piece_value: piece_value,
    valid: piece_turn && (!capture_required || capture_required && capture),
    capture: capture,
    capture_diff: if capture { (board.cells[i][j]).abs() - piece_value.abs() } else { 0 },
    capture_value: if capture { (board.cells[i][j]).abs() } else { 0 }
  }
}

fn pawn_dir(piece_value: i32) -> i32 {
  if piece_value < 0 { 1 } else { -1 }
}
