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
  let other = chess::pieces::comp::opposing_pieces(piece_value, board.cells[i][j]);
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

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_moves;
  use super::super::test_helper;

  #[test]
  fn it_moves_all_hoppy() {
    let board = fen_parser::board_from_fen("8/8/8/3N4/8/8/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 2, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[1,2], 2, true),
      chess::Move::new_default([3,3],[1,4], 2, true),
      chess::Move::new_default([3,3],[2,1], 2, true),
      chess::Move::new_default([3,3],[2,5], 2, true),
      chess::Move::new_default([3,3],[4,1], 2, true),
      chess::Move::new_default([3,3],[4,5], 2, true),
      chess::Move::new_default([3,3],[5,2], 2, true),
      chess::Move::new_default([3,3],[5,4], 2, true)
    ), &moves);
  }

  #[test]
  fn it_cannot_capture_its_own_pieces() {
    let board = fen_parser::board_from_fen("8/2Q1P3/1R3P2/3N4/1B3P2/2N1P3/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 2, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[1,2], 2, false, false, 0, 0),
      chess::Move::new([3,3],[1,4], 2, false, false, 0, 0),
      chess::Move::new([3,3],[2,1], 2, false, false, 0, 0),
      chess::Move::new([3,3],[2,5], 2, false, false, 0, 0),
      chess::Move::new([3,3],[4,1], 2, false, false, 0, 0),
      chess::Move::new([3,3],[4,5], 2, false, false, 0, 0),
      chess::Move::new([3,3],[5,2], 2, false, false, 0, 0),
      chess::Move::new([3,3],[5,4], 2, false, false, 0, 0)
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/2q1p3/1r3p2/3N4/1b3p2/2n1p3/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 2, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[1,2], 2, true, true, 5, 3),
      chess::Move::new([3,3],[1,4], 2, true, true, 1, -1),
      chess::Move::new([3,3],[2,1], 2, true, true, 4, 2),
      chess::Move::new([3,3],[2,5], 2, true, true, 1, -1),
      chess::Move::new([3,3],[4,1], 2, true, true, 3, 1),
      chess::Move::new([3,3],[4,5], 2, true, true, 1, -1),
      chess::Move::new([3,3],[5,2], 2, true, true, 2, 0),
      chess::Move::new([3,3],[5,4], 2, true, true, 1, -1)
    ), &moves);
  }
}
