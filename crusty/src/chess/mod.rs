use std::collections::LinkedList;
mod pieces;

pub struct Board {
  pub cells: Vec<Vec<i32>>,
  moves: Vec<Move>
}

struct Move {
  pub from_cell: [i32; 2],
  pub to_cell: [i32, 2]
  pub fn to_string(&self) -> String {
    let s = format!("{}{}", self.from_cell, self.to_cell);
    s
  }
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

pub fn board_moves(board Board) -> &LinkedList {
  let mut moves = LinkedList::new()
  for row in &board.cells.iter() {
    for cell in &row.iter() {
      moves.append(piece_moves(board, *cell));
    }
  }

  &moves
}

fn piece_moves(board: Board, piece_value: i32) -> fn() -> &LinkedList {
  let piece_mover = match *piece_value {
    -1 => pieces::pawn,
    -2 => pieces::knight,
    -3 => pieces::bishop,
    -4 => pieces::rook,
    -5 => pieces::queen,
    -6 => pieces::king,
    1 => pieces::pawn,
    2 => pieces::knight,
    3 => pieces::bishop,
    4 => pieces::rook,
    5 => pieces::queen,
    6 => pieces::king,
    _ => fn () -> None { None }
  };
  let result = piece_mover::get_moves(board, piece_value);
  result
}


