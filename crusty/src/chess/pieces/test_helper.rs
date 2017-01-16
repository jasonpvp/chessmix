use ::chess;
use std;

pub fn assert_moves(expected: Vec<chess::Move>, actual: &Vec<chess::Move>) {
  let expected_len = expected.len();
  print_moves_str("Expected", &expected);
  print_moves_str("Actual", &actual);

  assert_eq!(expected_len, actual.len(), "move counts mismatch");

  let mut all_sum = 0;
  let mut match_count = 0;
  for e in expected.iter() {
    for (i, a) in actual.iter().enumerate() {
      if a.eq(&e) {
        all_sum += i + 1;
        match_count += 1;
      }
    }
  }

  assert_eq!(expected.len(), match_count, "match counts mismatch");
  assert_eq!((expected_len * (expected_len + 1)) / 2, all_sum, "move details mismatch");
}

fn print_moves_str(typ: &str, moves: &Vec<chess::Move>) {
  let mut mm = moves.clone();
  mm.sort_by(move_sorter);
  let ms = mm.iter().fold(format!("\n{}\n", typ), |s, m| {
    format!("{}, {} valid: {}, capture: {}, value: {}, diff: {}", s, move_str(m), m.valid, m.capture, m.capture_value, m.capture_diff)
  });
  println!("{}\n\n", ms);
}

fn move_sorter(a: &chess::Move, b: &chess::Move) -> std::cmp::Ordering {
  move_str(a).cmp(&move_str(b))
}

fn move_str(m: &chess::Move) -> String {
  format!("({},{})-({},{})", m.from_cell[0], m.from_cell[1], m.to_cell[0], m.to_cell[1])
}

