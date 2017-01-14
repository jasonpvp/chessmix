mod pieces;
pub mod scored_move;

pub struct Board {
  pub cells: Vec<Vec<i32>>,
  pub topology: scored_move::BoardTopology
}

impl Board {
  pub fn new (cells: Vec<Vec<i32>>) -> Board {
    Board {
      cells: cells,
      topology: scored_move::BoardTopology::new()
    }
  }
}

#[derive(Copy, Clone)]
pub struct Context {
  pub depth: i32,
  pub max_depth: i32,
  pub turn: i32
}

#[derive(Copy, Clone)]
pub struct Move {
  pub from_cell: [usize; 2],
  pub to_cell: [usize; 2],
  pub piece_value: i32,
  pub valid: bool
}

pub fn board_to_ascii(board: &Board) -> String {
  let ref cells_slice = board.cells;
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

pub fn get_moves(board: &Board, context: &Context) -> Vec<Move> {
  let mut moves = Vec::new();
  let ref cells_slice = board.cells;
  let mut i = 0;
  let mut j = 0;
  for row in cells_slice.iter() {
    for cell in row.iter() {
      let piece_turn = pieces::comp::same_color(*cell, context.turn);
      let new_moves = piece_moves(board, *cell, piece_turn, [i, j]);
      moves.extend(new_moves);
      j = j + 1;
    }
    i = i + 1;
    j = 0;
  }
  moves
}

pub fn get_best_move(board: &Board, moves: &Vec<Move>, context: Context) -> scored_move::ScoredMove {
  let mut scored_moves = get_scored_moves(board, moves, context);
  scored_moves.sort_by(|a, b| b.eval.abs_score.cmp(&a.eval.abs_score));
  scored_moves[0].clone()
}

pub fn get_scored_moves(board: &Board, moves: &Vec<Move>, context: Context) -> Vec<scored_move::ScoredMove> {
  if context.depth == context.max_depth {
    moves.iter().fold(vec![], |mut scored_moves, move_info| {
      if move_info.valid {
        let m = move_info;
        scored_moves.push(scored_move::get_scored_move(move_info, &board.topology));
      }
      scored_moves
    })
  } else {
    let next_context = Context {
      depth: context.depth + 1,
      max_depth: context.max_depth,
      turn: if context.turn == 1 { -1 } else { 1 }
    };
    moves.iter().fold(vec![], |mut scored_moves, move_info| {
      if move_info.valid {// && move_info.to_cell[0] == 4 && move_info.to_cell[1] == 0 {
        let mut next_board = Board::new(make_move(&board.cells, move_info));
        let next_moves = get_moves(&next_board, &next_context);
        next_board.topology = scored_move::get_board_topology(&next_moves);
        let best_move = get_best_move(&next_board, &next_moves, next_context);
        scored_moves.push(scored_move::make_scored_move(move_info, best_move.eval));
      }
      scored_moves
    })
  }
}

fn make_move(cells: &Vec<Vec<i32>>, m: &Move) -> Vec<Vec<i32>> {
  let mut new_cells = cells.clone();
  new_cells[m.to_cell[0]][m.to_cell[1]] = new_cells[m.from_cell[0]][m.from_cell[1]];
  new_cells[m.from_cell[0]][m.from_cell[1]] = 0;
  new_cells
}

fn piece_moves(board: &Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<Move> {
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
  piece_mover(board, piece_value, piece_turn, cell)
}

fn null_piece_moves (board: &Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<Move> {
  vec![]
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
