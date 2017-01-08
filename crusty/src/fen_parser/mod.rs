extern crate crusty;
use crusty::chess as chess;

// Given a fen string, such as: "pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
// returns a Board in the state represented by the string
pub fn board_from_fen (fen_str: String) -> chess::Board {
  let mut parts = fen_str.split_whitespace();

  chess::Board {
    cells: fen_cells(parts.next())
  }
}

fn fen_cells (fen_str_cells: String) -> &[[i32; 8]; 8] {
  let mut i = 0;
  let mut j = 0;
  let mut empty_cells = &[[i32; 8]; 8];

  fen_str_cells.chars().iter().fold(empty_cells, |cells, char| {
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
      j = j + skip.unwrap();
    }
    cells
  });
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
    'K' => 5,
    default => 0
  }
}
