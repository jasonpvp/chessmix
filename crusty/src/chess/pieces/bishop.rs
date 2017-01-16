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

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_moves;
  use super::super::test_helper;

  #[test]
  fn it_moves_diagonally_in_each_direction() {
    let board = fen_parser::board_from_fen("8/8/8/3B4/8/8/8/8 w KQkq - 0 1".to_owned());
    let moves = get_moves(&board, 3, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[0,0], 3, true),
      chess::Move::new_default([3,3],[1,1], 3, true),
      chess::Move::new_default([3,3],[2,2], 3, true),
      chess::Move::new_default([3,3],[4,4], 3, true),
      chess::Move::new_default([3,3],[5,5], 3, true),
      chess::Move::new_default([3,3],[6,6], 3, true),
      chess::Move::new_default([3,3],[7,7], 3, true),
      chess::Move::new_default([3,3],[2,4], 3, true),
      chess::Move::new_default([3,3],[1,5], 3, true),
      chess::Move::new_default([3,3],[0,6], 3, true),
      chess::Move::new_default([3,3],[4,2], 3, true),
      chess::Move::new_default([3,3],[5,1], 3, true),
      chess::Move::new_default([3,3],[6,0], 3, true)
    ), &moves);
  }

  #[test]
  fn it_cannot_move_past_other_pieces() {
    let board = fen_parser::board_from_fen("8/1R3P2/8/3B4/8/1B3P2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 3, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[1,1], 3, false),
      chess::Move::new_default([3,3],[2,2], 3, true),
      chess::Move::new_default([3,3],[4,4], 3, true),
      chess::Move::new_default([3,3],[5,5], 3, false),
      chess::Move::new_default([3,3],[2,4], 3, true),
      chess::Move::new_default([3,3],[1,5], 3, false),
      chess::Move::new_default([3,3],[4,2], 3, true),
      chess::Move::new_default([3,3],[5,1], 3, false),
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/1r3p2/8/3B4/8/1b3p2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 3, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[1,1], 3, true, true, 4, 1),
      chess::Move::new([3,3],[2,2], 3, true, false, 0, 0),
      chess::Move::new([3,3],[4,4], 3, true, false, 0, 0),
      chess::Move::new([3,3],[5,5], 3, true, true, 1, -2),
      chess::Move::new([3,3],[2,4], 3, true, false, 0, 0),
      chess::Move::new([3,3],[1,5], 3, true, true, 1, -2),
      chess::Move::new([3,3],[4,2], 3, true, false, 0, 0),
      chess::Move::new([3,3],[5,1], 3, true, true, 3, 0),
    ), &moves);
  }
}
