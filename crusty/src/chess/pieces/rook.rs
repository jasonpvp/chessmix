use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [1, 0]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [-1, 0]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [0, 1]));
  moves.extend(chess::pieces::linear_moves::get_moves(board, piece_value, piece_turn, cell, [0, -1]));
  moves
}

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_moves;
  use super::super::test_helper;

  #[test]
  fn it_moves_linearly_in_each_direction() {
    let board = fen_parser::board_from_fen("8/8/8/3Q4/8/8/8/8 w KQkq - 0 1".to_owned());
    let moves = get_moves(&board, 4, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[3,0], 4, true),
      chess::Move::new_default([3,3],[3,1], 4, true),
      chess::Move::new_default([3,3],[3,2], 4, true),
      chess::Move::new_default([3,3],[3,4], 4, true),
      chess::Move::new_default([3,3],[3,5], 4, true),
      chess::Move::new_default([3,3],[3,6], 4, true),
      chess::Move::new_default([3,3],[3,7], 4, true),
      chess::Move::new_default([3,3],[0,3], 4, true),
      chess::Move::new_default([3,3],[1,3], 4, true),
      chess::Move::new_default([3,3],[2,3], 4, true),
      chess::Move::new_default([3,3],[4,3], 4, true),
      chess::Move::new_default([3,3],[5,3], 4, true),
      chess::Move::new_default([3,3],[6,3], 4, true),
      chess::Move::new_default([3,3],[7,3], 4, true)
    ), &moves);
  }

  #[test]
  fn it_cannot_move_past_other_pieces() {
    let board = fen_parser::board_from_fen("8/1P1P1P2/8/1P1Q1P2/8/1P1P1P2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 4, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[3,1], 4, false, false, 0, 0),
      chess::Move::new([3,3],[3,2], 4, true, false, 0, 0),
      chess::Move::new([3,3],[3,4], 4, true, false, 0, 0),
      chess::Move::new([3,3],[3,5], 4, false, false, 0, 0),
      chess::Move::new([3,3],[1,3], 4, false, false, 0, 0),
      chess::Move::new([3,3],[2,3], 4, true, false, 0, 0),
      chess::Move::new([3,3],[4,3], 4, true, false, 0, 0),
      chess::Move::new([3,3],[5,3], 4, false, false, 0, 0)
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/1q1n1p2/8/1r1Q1p2/8/1b1k1p2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 4, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[3,1], 4, true, true, 4, 0),
      chess::Move::new([3,3],[3,2], 4, true, false, 0, 0),
      chess::Move::new([3,3],[3,4], 4, true, false, 0, 0),
      chess::Move::new([3,3],[3,5], 4, true, true, 1, -3),
      chess::Move::new([3,3],[1,3], 4, true, true, 2, -2),
      chess::Move::new([3,3],[2,3], 4, true, false, 0, 0),
      chess::Move::new([3,3],[4,3], 4, true, false, 0, 0),
      chess::Move::new([3,3],[5,3], 4, true, true, 6, 2)
    ), &moves);
  }
}
