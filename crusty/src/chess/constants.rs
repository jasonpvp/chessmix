pub fn piece_weight(piece_value: i32, depth: i32) -> i32 {
  match piece_value {
    -1 => -1,
    -2 => -2,
    -3 => -3,
    -4 => -4,
    -5 => -10,
    -6 => -10000000 / depth,
    1 => 1,
    2 => 2,
    3 => 3,
    4 => 4,
    5 => 10,
    6 => 10000000 / depth,
    0 => 0,
    _ => 0
  }
}


