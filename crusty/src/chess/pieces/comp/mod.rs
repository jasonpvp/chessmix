pub fn same_color(val1: i32, val2: i32) -> bool {
  let c1 = if val1 < 0 { -1 } else if val1 > 0 { 1 } else { 0 };
  let c2 = if val2 < 0 { -1 } else if val2 > 0 { 1 } else { 0 };
  c1 == c2
}

pub fn opposing_pieces(val1: i32, val2: i32) -> bool {
  let c1 = if val1 < 0 { -1 } else if val1 > 0 { 1 } else { 0 };
  let c2 = if val2 < 0 { -1 } else if val2 > 0 { 1 } else { 0 };
  (c1 + c2 == 0) && (c1 != 0)
}
