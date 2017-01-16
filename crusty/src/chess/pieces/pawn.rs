use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  let dir = pawn_dir(piece_value);
  let row = cell[0] as i32;
  let next_row = row + dir;
  let col = cell[1] as i32;
  // move forward 1 space
  moves.push(get_move(board, piece_value, piece_turn, cell, [next_row as usize, col as usize], false));
  let unmoved = if (row == 1 && dir == 1) || (row == 6 && dir == -1) { true } else { false };
  if unmoved && board.cells[(next_row + dir) as usize][col as usize] == 0 {
    // move forward 2 spaces
    moves.push(get_move(board, piece_value, piece_turn, cell, [(next_row + dir) as usize, col as usize], false));
  }
  for i in &[-1, 1] {
    let capture_col = col + i;
    if capture_col >=0 && capture_col <= 7 {
      // capture piece in next row
      moves.push(get_move(board, piece_value, piece_turn, cell, [next_row as usize, capture_col as usize], true));
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
  let valid = piece_turn && capture_required == capture && capture == occupied;
  if valid && board.cells[i][j] == 5 && from_cell[0] == 6 && from_cell[1] == 5 && to_cell[0] == 5 && to_cell[1] == 5 {
    println!("PAWN: valid: {}, cap_req: {}, capture: {}", valid, capture_required, capture);
  }
  chess::Move {
    from_cell: from_cell,
    to_cell: to_cell,
    piece_value: piece_value,
    valid: valid,
    capture: capture,
    capture_diff: if capture { (board.cells[i][j]).abs() - piece_value.abs() } else { 0 },
    capture_value: if capture { (board.cells[i][j]).abs() } else { 0 }
  }
}

fn pawn_dir(piece_value: i32) -> i32 {
  if piece_value < 0 { 1 } else { -1 }
}

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_moves;
  use super::super::test_helper;

  #[test]
  fn it_can_move_one_or_two_from_start() {
    let board = fen_parser::board_from_fen("8/8/8/8/8/8/1P6/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [6,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([6,1],[5,1], 1, true),
      chess::Move::new_default([6,1],[4,1], 1, true),
      chess::Move::new_default([6,1],[5,0], 1, false),
      chess::Move::new_default([6,1],[5,2], 1, false)
    ), &moves);
  }

  #[test]
  fn it_can_move_one_space_after_start() {
    let board = fen_parser::board_from_fen("8/8/8/8/8/1P6/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([5,1],[4,1], 1, true),
      chess::Move::new_default([5,1],[4,0], 1, false),
      chess::Move::new_default([5,1],[4,2], 1, false)
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/8/8/8/r1b5/1P6/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([5,1],[4,1], 1, true, false, 0, 0),
      chess::Move::new([5,1],[4,0], 1, true, true, 4, 3),
      chess::Move::new([5,1],[4,2], 1, true, true, 3, 2)
    ), &moves);
  }

  fn it_does_not_capture_its_own_pieces() {
    let board = fen_parser::board_from_fen("8/8/8/8/R1B5/1P6/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([5,1],[4,1], 1, true, false, 0, 0),
      chess::Move::new([5,1],[4,0], 1, false, false, 0, 0),
      chess::Move::new([5,1],[4,2], 1, false, false, 0, 0)
    ), &moves);
  }

  fn it_cannot_capture_forward() {
    let board = fen_parser::board_from_fen("8/8/8/8/1r6/8/1P6/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([6,1],[5,1], 1, true, false, 0, 0),
      chess::Move::new([6,1],[4,1], 1, false, false, 0, 0),
      chess::Move::new([6,1],[5,0], 1, false, false, 0, 0),
      chess::Move::new([6,1],[5,2], 1, false, false, 0, 0)
    ), &moves);

    let board = fen_parser::board_from_fen("8/8/8/8/1r6/1P6/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([5,1],[4,1], 1, true, false, 0, 0),
      chess::Move::new([5,1],[4,0], 1, false, false, 0, 0),
      chess::Move::new([5,1],[4,2], 1, false, false, 0, 0)
    ), &moves);
  }

  fn it_cannot_capture_its_own() {
    let board = fen_parser::board_from_fen("8/8/8/8/RRR5/8/1P6/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([6,1],[5,1], 1, true, false, 0, 0),
      chess::Move::new([6,1],[4,1], 1, false, false, 0, 0),
      chess::Move::new([6,1],[5,0], 1, false, false, 0, 0),
      chess::Move::new([6,1],[5,2], 1, false, false, 0, 0)
    ), &moves);

    let board = fen_parser::board_from_fen("8/8/8/8/RRR5/1P6/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 1, true, [5,1]);
    test_helper::assert_moves(vec!(
      chess::Move::new([5,1],[4,1], 1, false, false, 0, 0),
      chess::Move::new([5,1],[4,0], 1, false, false, 0, 0),
      chess::Move::new([5,1],[4,2], 1, false, false, 0, 0)
    ), &moves);
  }
}
