pub fn same_color(val1: i32, val2: i32) -> bool {
  let c1 = if val1 < 0 { -1 } else { 1 };
  let c2 = if val2 < 0 { -1 } else { 1 };
  c1 == c2
}
