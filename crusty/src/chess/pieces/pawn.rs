use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  let dir = pawn_dir(piece_value);
  let row = cell[0];
  let next_row = row + dir as usize;
  let col = cell[1];
  // move forward 1 space
  moves.push(get_move(board, piece_value, [next_row, col], false));
  let unmoved = if (row == 1 && dir == 1) || (row == 6 && dir == -1) { true } else { false };
  if unmoved && board.cells[row][col] == 0 {
    // move forward 2 spaces
    moves.push(get_move(board, piece_value, [next_row + dir as usize, col], false));
  }
  for i in &[-1, 1] {
    let capture_col = col as i32 + i;
    if capture_col >=0 && capture_col <= 7 {
      // capture piece in next row
      moves.push(get_move(board, piece_value, [next_row, capture_col as usize], true));
    }
  }
  // TODO: implement en passant
  moves
}

fn get_move(board: &chess::Board, piece_value: i32, cell: [usize; 2], capture: bool) -> chess::Move {
  let i = cell[0];
  let j = cell[1];
  let occupied = board.cells[i][j] != 0;
  let other = chess::pieces::comp::same_color(piece_value, board.cells[i][j]);
  chess::Move {
    from_cell: cell,
    to_cell: [i, j],
    piece_value: piece_value,
    valid: (!occupied && !capture) || (occupied && capture && other)
  }
}

fn pawn_dir(piece_value: i32) -> i32 {
  if piece_value < 0 { 1 } else { -1 }
}
