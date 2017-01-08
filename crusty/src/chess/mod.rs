pub struct Board {
  pub cells: Vec<Vec<i32>>
}

pub fn board_to_ascii(board: Board) -> String {
  let ascii: String = board.cells.iter().fold("".to_owned(), |mut str: String, row: &Vec<i32>| {
    let row_str = row.iter().fold("".to_owned(), |mut rstr: String, val: &i32| {
      rstr = format!("{}{} ", rstr, piece_code(val));
      rstr
    });
    str = format!("{}\n{}", str, row_str);
    str
  });
  ascii
}

fn piece_code(piece_value: &i32) -> char {
  match *piece_value {
    -1 => 'p',
    -2 => 'n',
    -3 => 'b',
    -4 => 'r',
    -5 => 'q',
    -6 => 'k',
    1 => 'P',
    2 => 'N',
    3 => 'B',
    4 => 'R',
    5 => 'Q',
    6 => 'K',
    0 => '.',
    _ => '.'
  }
}
