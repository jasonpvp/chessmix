use ::chess;

pub fn get_topology_score(board: &chess::Board, context: &chess::Context) -> (f32, bool, bool) {
  let mut score = 0.0;
  let mut player_in_check = true;
  let mut opponent_in_check = true;
  // This is a crappy proxy for a more complicated calculation
  for (i, row) in board.topology.cells.iter().enumerate() {
    for (j, cell) in row.iter().enumerate() {
      let piece_value = board.cells[i][j];
      let (player_covers, other_covers) = like_pieces_sorted(cell, context.player);
      let min_len = if player_covers.len() < other_covers.len() { player_covers.len() } else { other_covers.len() };

      if piece_value != 0 {
//        println!("\n{},{} piece_value: {}", i, j, piece_value);
//        let pcs = player_covers.iter().fold("".to_owned(), |s, v| { format!("{}, {}", s, v)});
//        let ocs = other_covers.iter().fold("".to_owned(), |s, v| { format!("{}, {}", s, v)});
//        println!("piece covers: {}\nother covers: {}", pcs, ocs);
        let mut piece_at_risk = other_covers.len() > 0;
        if piece_at_risk {
          if chess::pieces::comp::same_color(piece_value, context.player) {
            let s = trade_score(&other_covers, &player_covers, piece_value) as f32 * -1.0;
//            println!("add {}", s);
            score += s;
          } else {
            let s = trade_score(&player_covers, &other_covers, piece_value) as f32 * -1.0;
//            println!("add {}", s);
            score += s;
          }
        }

        let player_king = piece_value * context.player == 6;
        let opponent_king = piece_value * context.player == -6;
        if player_king {
          player_in_check = player_in_check && piece_at_risk;
        } else if opponent_king {
          opponent_in_check = opponent_in_check && piece_at_risk;
        }
      }
    }
  }
  (score * context.player as f32, player_in_check, opponent_in_check)
}

pub fn trade_score(first_pieces: &Vec<i32>, second_pieces: &Vec<i32>, mut prev_piece: i32) -> i32 {
  let min_len = if first_pieces.len() < second_pieces.len() { first_pieces.len() } else { second_pieces.len() };
  let mut score = 0;
  if min_len > 0 {
    for i in 0..min_len {
      println!("{} takes {}, {} takes {}", chess::constants::piece_weight(first_pieces[i], 1), chess::constants::piece_weight(prev_piece, 1), chess::constants::piece_weight(second_pieces[i], 1), chess::constants::piece_weight(first_pieces[i], 1));
      score += chess::constants::piece_weight(prev_piece, 1) + chess::constants::piece_weight(first_pieces[i], 1);
      prev_piece = second_pieces[i];
    }
  }
  score
}

pub fn like_pieces_sorted(piece_values: &Vec<i32>, player: i32) -> (Vec<i32>, Vec<i32>) {
  let mut sorted = piece_values.clone();
  sorted.sort();
  let mut middle = 0;
  let mut last_val = -1;
  for (i, val) in sorted.iter().enumerate() {
    if last_val < 0 && *val > 0 {
      middle = i;
    }
    last_val = *val;
  }
  let empty = Vec::new();
  let mut black_pieces = (if middle > 0 { &sorted[..(middle as usize)]} else { &empty }).to_vec();
  let white_pieces = (if middle < sorted.len() { &sorted[(middle) as usize..] } else { &empty }).to_vec();
  black_pieces.reverse();

  if player == 1 {
    (white_pieces, black_pieces)
  } else {
    (black_pieces, white_pieces)
  }
}

#[cfg(test)]
mod tests {
  use ::chess;
  use ::fen_parser;
  use super::get_topology_score;
  use super::like_pieces_sorted;

  #[test]
  fn like_pieces_are_split() {
    let piece_values = vec!(-5, -1, -2, -2, -1, 3, 1, 5, 4);
    let (player_values, other_values) = like_pieces_sorted(&piece_values, 1);
    assert_eq!(vec!(-1, -1, -2, -2, -5), other_values);
    assert_eq!(vec!(1, 3, 4, 5), player_values);
  }

  fn setup_from_fen(fen: String) -> (chess::Board, Vec<chess::Move>, chess::Context) {
    let mut board = fen_parser::board_from_fen(fen);
    let context = chess::Context{start_time: 0, max_duration: 100, diff: 0, depth: 1, max_depth: 1, player: 1, turn: 1, path: Vec::new()};
    let moves = chess::get_moves(&board, &context);
    board.topology = chess::scored_move::get_board_topology(&moves);
    (board, moves, context)
  }

  fn weighted_piece_sum(piece_values: Vec<i32>) -> f32 {
    (piece_values.iter().fold(0, |sum, val| { sum + chess::constants::piece_weight(*val, 1)}) * -1) as f32
  }

  #[test]
  fn scored_a_balanced_board_as_zero() {
    let (board, moves, context) = setup_from_fen("8/8/5k2/4q3/3Q4/2K5/8/8 w - - 0 4".to_owned());
    let (score, player_in_check, opponent_in_check) = get_topology_score(&board, &context);
    assert_eq!(0.0, score);
  }

  #[test]
  fn scores_trades() {
    let (board, moves, context) = setup_from_fen("8/8/2k5/2n5/3n4/1B6/Q1P5/K7 w - - 0 4".to_owned());
    let (score, player_in_check, opponent_in_check) = get_topology_score(&board, &context);
    let expected_score = weighted_piece_sum(vec!(3, 1, -2, -2, 1, -2));
    assert_eq!(expected_score, score);
  }

  #[test]
  fn scores_king_threat() {
    let (board, moves, context) = setup_from_fen("rnbqkb1r/pppppppp/7n/8/2B1PQ2/5R2/PPPP1PPP/RNB1K1N1 w KQkq - 0 1".to_owned());
    let (score, player_in_check, opponent_in_check) = get_topology_score(&board, &context);
    let expected_score = weighted_piece_sum(vec!(-1, 3, -2, 5, -6));
    assert_eq!(expected_score, score);
  }

  #[test]
  fn flags_moves_as_in_check() {
    let mut board = fen_parser::board_from_fen("rnbqkbnr/1ppppQpp/8/p7/2B5/4P3/PPPP1PPP/RNB1K1NR w KQkq - 0 4".to_owned());
    let context = chess::Context{start_time: 0, max_duration: 100, diff: 0, depth: 1, max_depth: 1, player: 1, turn: 1, path: Vec::new()};
    let moves = chess::get_moves(&board, &context);
    board.topology = chess::scored_move::get_board_topology(&moves);
    let (score, player_in_check, opponent_in_check) = get_topology_score(&board, &context);
    assert!(opponent_in_check);
    assert!(!player_in_check);
  }
}
