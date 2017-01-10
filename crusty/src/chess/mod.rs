mod pieces;

pub struct Board {
  pub cells: Vec<Vec<i32>>,
  pub moves: Vec<Move>
}

pub struct Move {
  pub from_cell: [i32; 2],
  pub to_cell: [i32; 2],
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
  for row in cells_slice.iter() {
    for cell in row.iter() {
      let new_moves = piece_moves(&board, *cell);
      moves.extend(new_moves);
    }
  }

  moves
}

fn piece_moves(board: &Board, piece_value: i32) -> Vec<Move> {
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
  let result = piece_mover(board, piece_value);
  result
}

fn null_piece_moves (board: &Board, piece_value: i32) -> Vec<Move> {
  vec![]
}
