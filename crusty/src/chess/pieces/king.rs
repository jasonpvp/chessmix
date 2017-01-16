use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in -1..2 {
    for j in -1..2 {
      let mut ii = cell[0] as i32 + i;
      let mut jj = cell[1] as i32 + j;
      if (i != 0 || j != 0) && ii >= 0 && ii <= 7 && jj >= 0 && jj <= 7 {
        moves.push(get_move(board, cell, [ii as usize, jj as usize], piece_value, piece_turn));
      }
    }
  }

  moves
}

fn get_move(board: &chess::Board, from_cell: [usize; 2], to_cell: [usize; 2], piece_value: i32, piece_turn: bool) -> chess::Move {
  let occupied = board.cells[to_cell[0]][to_cell[1]] != 0;
  let other = chess::pieces::comp::opposing_pieces(piece_value, board.cells[to_cell[0]][to_cell[1]]);
  let capture = other && occupied;
  let valid = piece_turn && (other || !occupied);

  chess::Move {
    from_cell: from_cell,
    to_cell: to_cell,
    piece_value: piece_value,
    valid: valid,
    capture: capture,
    capture_diff: if capture { (board.cells[to_cell[0]][to_cell[1]]).abs() - piece_value.abs() } else { 0 },
    capture_value: if capture { (board.cells[to_cell[0]][to_cell[1]]).abs() } else { 0 }
  }
}

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_moves;
  use super::super::test_helper;

  #[test]
  fn it_moves_one_cell_in_each_direction() {
    let board = fen_parser::board_from_fen("8/8/8/3K4/8/8/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 6, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[2,2], 6, true),
      chess::Move::new_default([3,3],[4,4], 6, true),
      chess::Move::new_default([3,3],[2,4], 6, true),
      chess::Move::new_default([3,3],[4,2], 6, true),
      chess::Move::new_default([3,3],[2,3], 6, true),
      chess::Move::new_default([3,3],[4,3], 6, true),
      chess::Move::new_default([3,3],[3,2], 6, true),
      chess::Move::new_default([3,3],[3,4], 6, true)
    ), &moves);
  }

  #[test]
  fn it_cannot_capture_its_own_pieces() {
    let board = fen_parser::board_from_fen("8/8/2PPP3/2PKP3/2PPP3/8/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 6, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[2,2], 6, false, false, 0, 0),
      chess::Move::new([3,3],[4,4], 6, false, false, 0, 0),
      chess::Move::new([3,3],[2,4], 6, false, false, 0, 0),
      chess::Move::new([3,3],[4,2], 6, false, false, 0, 0),
      chess::Move::new([3,3],[2,3], 6, false, false, 0, 0),
      chess::Move::new([3,3],[4,3], 6, false, false, 0, 0),
      chess::Move::new([3,3],[3,2], 6, false, false, 0, 0),
      chess::Move::new([3,3],[3,4], 6, false, false, 0, 0)
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/8/2bpn3/2rKn3/2qpp3/8/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 6, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[2,2], 6, true, true, 3, -3),
      chess::Move::new([3,3],[4,4], 6, true, true, 1, -5),
      chess::Move::new([3,3],[2,4], 6, true, true, 2, -4),
      chess::Move::new([3,3],[4,2], 6, true, true, 5, -1),
      chess::Move::new([3,3],[2,3], 6, true, true, 1, -5),
      chess::Move::new([3,3],[4,3], 6, true, true, 1, -5),
      chess::Move::new([3,3],[3,2], 6, true, true, 4, -2),
      chess::Move::new([3,3],[3,4], 6, true, true, 2, -4)
    ), &moves);
  }
}
