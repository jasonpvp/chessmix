mod pieces;
pub mod scored_move;

pub struct Board {
  pub cells: Vec<Vec<i32>>,
  pub moves: Vec<scored_move::ScoredMove>
}

pub struct Move {
  pub from_cell: [usize; 2],
  pub to_cell: [usize; 2],
  pub piece_value: i32,
  pub valid: bool
}

pub fn board_to_ascii(board: Board) -> String {
  let cells_slice = &board.cells;
  let ascii: String = cells_slice.iter().fold("".to_owned(), |mut str: String, row: &Vec<i32>| {
    let row_str = row.iter().fold("".to_owned(), |mut rstr: String, val: &i32| {
      rstr = format!("{}{} ", rstr, piece_code(*val));
      rstr
    });
    str = format!("{}\n{}", str, row_str);
    str
  });
  ascii
}

fn piece_code(piece_value: i32) -> char {
  match piece_value {
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

pub fn board_moves(board: Board) -> Vec<Move> {
  let mut moves = Vec::new();
  let cells_slice = &board.cells;
  let mut i = 0;
  let mut j = 0;
  for row in cells_slice.iter() {
    for cell in row.iter() {
      let new_moves = piece_moves(&board, *cell, [i, j]);
      moves.extend(new_moves);
      j = j + 1;
    }
    i = i + 1;
    j = 0;
  }

  moves
}

fn piece_moves(board: &Board, piece_value: i32, cell: [usize; 2]) -> Vec<Move> {
  let piece_mover = match piece_value {
    -1 => pieces::pawn::get_moves,
    -2 => pieces::knight::get_moves,
    -3 => pieces::bishop::get_moves,
    -4 => pieces::rook::get_moves,
    -5 => pieces::queen::get_moves,
    -6 => pieces::king::get_moves,
    1 => pieces::pawn::get_moves,
    2 => pieces::knight::get_moves,
    3 => pieces::bishop::get_moves,
    4 => pieces::rook::get_moves,
    5 => pieces::queen::get_moves,
    6 => pieces::king::get_moves,
    _ => null_piece_moves
  };
  let result = piece_mover(board, piece_value, cell);
  result
}

fn null_piece_moves (board: &Board, piece_value: i32, cell: [usize; 2]) -> Vec<Move> {
  vec![]
}
