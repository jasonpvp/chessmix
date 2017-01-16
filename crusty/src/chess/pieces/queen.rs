use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  moves.extend(chess::pieces::rook::get_moves(board, piece_value, piece_turn, cell));
  moves.extend(chess::pieces::bishop::get_moves(board, piece_value, piece_turn, cell));
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
    let moves = get_moves(&board, 5, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new_default([3,3],[0,0], 5, true),
      chess::Move::new_default([3,3],[1,1], 5, true),
      chess::Move::new_default([3,3],[2,2], 5, true),
      chess::Move::new_default([3,3],[4,4], 5, true),
      chess::Move::new_default([3,3],[5,5], 5, true),
      chess::Move::new_default([3,3],[6,6], 5, true),
      chess::Move::new_default([3,3],[7,7], 5, true),
      chess::Move::new_default([3,3],[2,4], 5, true),
      chess::Move::new_default([3,3],[1,5], 5, true),
      chess::Move::new_default([3,3],[0,6], 5, true),
      chess::Move::new_default([3,3],[4,2], 5, true),
      chess::Move::new_default([3,3],[5,1], 5, true),
      chess::Move::new_default([3,3],[6,0], 5, true),

      chess::Move::new_default([3,3],[3,0], 5, true),
      chess::Move::new_default([3,3],[3,1], 5, true),
      chess::Move::new_default([3,3],[3,2], 5, true),
      chess::Move::new_default([3,3],[3,4], 5, true),
      chess::Move::new_default([3,3],[3,5], 5, true),
      chess::Move::new_default([3,3],[3,6], 5, true),
      chess::Move::new_default([3,3],[3,7], 5, true),
      chess::Move::new_default([3,3],[0,3], 5, true),
      chess::Move::new_default([3,3],[1,3], 5, true),
      chess::Move::new_default([3,3],[2,3], 5, true),
      chess::Move::new_default([3,3],[4,3], 5, true),
      chess::Move::new_default([3,3],[5,3], 5, true),
      chess::Move::new_default([3,3],[6,3], 5, true),
      chess::Move::new_default([3,3],[7,3], 5, true)
    ), &moves);
  }

  #[test]
  fn it_cannot_move_past_other_pieces() {
    let board = fen_parser::board_from_fen("8/1P1P1P2/8/1P1Q1P2/8/1P1P1P2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 5, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[1,1], 5, false, false, 0, 0),
      chess::Move::new([3,3],[2,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[4,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,5], 5, false, false, 0, 0),
      chess::Move::new([3,3],[2,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[1,5], 5, false, false, 0, 0),
      chess::Move::new([3,3],[4,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,1], 5, false, false, 0, 0),

      chess::Move::new([3,3],[3,1], 5, false, false, 0, 0),
      chess::Move::new([3,3],[3,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[3,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[3,5], 5, false, false, 0, 0),
      chess::Move::new([3,3],[1,3], 5, false, false, 0, 0),
      chess::Move::new([3,3],[2,3], 5, true, false, 0, 0),
      chess::Move::new([3,3],[4,3], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,3], 5, false, false, 0, 0)
    ), &moves);
  }

  #[test]
  fn it_captures_other_pieces() {
    let board = fen_parser::board_from_fen("8/1q1n1p2/8/1r1Q1p2/8/1b1k1p2/8/8 w - - 0 1".to_owned());
    let moves = get_moves(&board, 5, true, [3,3]);
    test_helper::assert_moves(vec!(
      chess::Move::new([3,3],[1,1], 5, true, true, 5, 0),
      chess::Move::new([3,3],[2,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[4,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,5], 5, true, true, 1, -4),
      chess::Move::new([3,3],[2,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[1,5], 5, true, true, 1, -4),
      chess::Move::new([3,3],[4,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,1], 5, true, true, 3, -2),

      chess::Move::new([3,3],[3,1], 5, true, true, 4, -1),
      chess::Move::new([3,3],[3,2], 5, true, false, 0, 0),
      chess::Move::new([3,3],[3,4], 5, true, false, 0, 0),
      chess::Move::new([3,3],[3,5], 5, true, true, 1, -4),
      chess::Move::new([3,3],[1,3], 5, true, true, 2, -3),
      chess::Move::new([3,3],[2,3], 5, true, false, 0, 0),
      chess::Move::new([3,3],[4,3], 5, true, false, 0, 0),
      chess::Move::new([3,3],[5,3], 5, true, true, 6, 1)
    ), &moves);
  }
}
