mod pieces;
use std;
pub mod scored_move;
use std::time::{Duration, Instant};
extern crate time;

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

pub struct Context {
  pub start_time: i64,
  pub max_duration: i64,
  pub diff: i32,
  pub depth: i32,
  pub max_depth: i32,
  pub player: i32,
  pub turn: i32,
  pub path: Vec<[[usize; 2]; 2]>
}

impl Clone for Context {
  fn clone(&self) -> Context {
    Context {
      start_time: self.start_time,
      max_duration: self.max_duration,
      diff: self.diff,
      depth: self.depth,
      max_depth: self.max_depth,
      player: self.player,
      turn: self.turn,
      path: self.path.to_owned()
    }
  }
}

#[derive(Copy, Clone)]
pub struct Move {
  pub from_cell: [usize; 2],
  pub to_cell: [usize; 2],
  pub piece_value: i32,
  pub valid: bool,
  pub capture: bool,
  pub capture_value: i32,
  pub capture_diff: i32
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
  moves.sort_by(sort_by_capture_descending);
//  if context.depth == 2 && board.cells[3][7] == 5 {
//    for m in moves.iter() {
//      println!("capture value: {} move piece: {}, move ({},{})-({},{}) valid: {}", m.capture_value, m.piece_value, m.from_cell[0], m.from_cell[1], m.to_cell[0], m.to_cell[1], m.valid);
//    }
//  }

  moves
}

pub fn get_best_move(board: &Board, moves: &Vec<Move>, context: &Context) -> scored_move::ScoredMove {
  let now = Instant::now();
  let null_move = Move { from_cell: [0, 0], to_cell: [0, 0], piece_value: 0, valid: false, capture: false, capture_diff: 0, capture_value: 0 };
  let best_move = get_best_move_recurse(board, moves, context, &null_move);
  println!("found best move in {}s", now.elapsed().as_secs());
  best_move
}

fn get_best_move_recurse(board: &Board, moves: &Vec<Move>, context: &Context, prev_move: &Move) -> scored_move::ScoredMove {
  if moves.len() == 0 {
    scored_move::get_scored_move(prev_move, &board, &context)
  } else {
    let mut scored_moves = get_scored_moves(board, moves, &context, prev_move);
    let sorter = if context.player == context.turn { sort_descending } else { sort_ascending };
    scored_moves.sort_by(sorter);
    if context.depth == 1 {
      for m in scored_moves.iter() {
        println!("{}", scored_move::serialize(m.clone()).to_string());
      }
    }
    scored_moves[0].clone()
  }
}

pub fn get_scored_moves(board: &Board, moves: &Vec<Move>, context: &Context, prev_move: &Move) -> Vec<scored_move::ScoredMove> {
  let mut next_path = context.path.to_owned();
  if prev_move.valid { next_path.push([prev_move.from_cell, prev_move.to_cell]) };
  let next_context = Context {
    start_time: context.start_time,
    max_duration: context.max_duration,
    diff: context.diff + prev_move.capture_diff,
    depth: context.depth + 1,
    max_depth: context.max_depth,
    player: context.player,
    turn: if context.turn == 1 { -1 } else { 1 },
    path: next_path
  };
  let search_duration = time::get_time().sec - context.start_time;
  let out_of_time = search_duration > context.max_duration;
//  let bad_move = next_context.diff < -2;
//  let boring_path = next_context.diff == 0 && context.depth == 4;

  if (context.depth == context.max_depth) || out_of_time {
    moves.iter().fold(vec![], |mut scored_moves, move_info| {
      if move_info.valid {
        let mut next_board = Board::new(make_move(&board.cells, move_info));
        scored_moves.push(scored_move::get_scored_move(move_info, &next_board, &next_context));
      }
      scored_moves
    })
  } else {
    moves.iter().fold(vec![], |mut scored_moves, move_info| {
      if move_info.valid {
        let mut next_board = Board::new(make_move(&board.cells, move_info));
        let next_moves = get_moves(&next_board, &next_context);
        next_board.topology = scored_move::get_board_topology(&next_moves);
        let best_move = get_best_move_recurse(&next_board, &next_moves, &next_context, move_info);
        scored_moves.push(scored_move::make_scored_move(move_info, &best_move));
      }
      scored_moves
    })
  }
}

fn match_move(m: &Move, f: [i32; 2], t: [i32; 2]) -> bool {
  m.from_cell[0] == f[0] as usize && m.from_cell[1] == f[1] as usize && m.to_cell[0] == t[0] as usize && m.to_cell[1] == t[1] as usize
}

fn sort_ascending(a: &scored_move::ScoredMove, b: &scored_move::ScoredMove) -> std::cmp::Ordering {
  a.eval.abs_score.cmp(&b.eval.abs_score)
}

fn sort_descending(a: &scored_move::ScoredMove, b: &scored_move::ScoredMove) -> std::cmp::Ordering {
  b.eval.abs_score.cmp(&a.eval.abs_score)
}

fn sort_by_capture_descending(a: &Move, b: &Move) -> std::cmp::Ordering {
  if a.valid && !b.valid {
    0.cmp(&1)
  } else if b.valid && !a.valid {
    1.cmp(&0)
  } else {
    b.capture_value.cmp(&a.capture_value)
  }
}

fn score_and_print_move(m: &Move, board: &Board, context: &Context) {
  let mut next_board = Board::new(make_move(&board.cells, m));
  let m = scored_move::get_scored_move(m, &next_board, &context);
  println!("CHECKMATE at depth {}: {}", context.depth, scored_move::serialize(m.clone()).to_string());
}

pub fn make_move(cells: &Vec<Vec<i32>>, m: &Move) -> Vec<Vec<i32>> {
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
