use ::chess;

// Given a fen string, such as: "pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
// returns a Board in the state represented by the string
pub fn board_from_fen (fen_str: String) -> chess::Board {
  let mut parts = fen_str.split_whitespace();
  let cells = fen_cells(parts.next().unwrap());
  let mut board = chess::Board::new(cells);
  board
}

fn fen_cells (fen_str_cells: &str) -> Vec<Vec<i32>> {
  let mut i = 0;
  let mut j = 0;

  let result_cells = fen_str_cells.chars().fold(vec![vec![0; 8]; 8], |mut cells, char| {
    let skip = char.to_digit(10);
    if skip == None {
      if char == '/' {
        i = i + 1;
        j = 0;
      } else {
        cells[i][j] = piece_value(char);
        j = j + 1;
      }
    } else {
      j = j + skip.unwrap() as usize;
    }
    cells
  });
  result_cells
}

fn piece_value(piece_code: char) -> i32 {
  match piece_code {
    'p' => -1,
    'n' => -2,
    'b' => -3,
    'r' => -4,
    'q' => -5,
    'k' => -6,
    'P' => 1,
    'N' => 2,
    'B' => 3,
    'R' => 4,
    'Q' => 5,
    'K' => 6,
    _ => 0
  }
}
