use rustc_serialize::json::{self};
use ::chess;

#[derive(Clone)]
pub struct ScoredMove {
  pub move_info: chess::Move,
  pub eval: Eval
}

pub struct BoardTopology {
  pub cells: Vec<Vec<Vec<i32>>>
}

impl BoardTopology {
  pub fn new () -> BoardTopology {
    BoardTopology {
      cells: vec![vec![vec![0; 12]; 8]; 8]
    }
  }
}

#[derive(Clone)]
pub struct Eval {
  pub score: i32,
  pub abs_score: i32,
  pub abs_delta: i32,
  pub path: String
}

//#[derive(RustcEncodable)]
//struct BoardTopologyRecord {
//  cells: Vec<Vec<Vec<i32>>>
//}

#[derive(RustcEncodable)]
struct ScoredMoveRecord {
  simple_move: String,
  eval: EvalRecord
}

#[derive(RustcEncodable)]
struct EvalRecord {
  score: i32,
  abs_score: i32,
  abs_delta: i32,
  path: String
}

fn num_to_char(n: usize) -> char {
  (n + 97) as u8 as char
}

pub fn serialize(scored_move: ScoredMove) -> String {
  let data: String = json::encode(&ScoredMoveRecord {
    simple_move: format!("{}{}{}{}", num_to_char(scored_move.move_info.from_cell[1]), scored_move.move_info.from_cell[0] + 1, num_to_char(scored_move.move_info.to_cell[1]), scored_move.move_info.to_cell[0] + 1),
    eval: EvalRecord {
      score: scored_move.eval.score,
      abs_score: scored_move.eval.abs_score,
      abs_delta: scored_move.eval.abs_delta,
      path: scored_move.eval.path,
    }
  }).unwrap();

  data
}

pub fn get_scored_move(move_info: &chess::Move, board: &chess::Board, context: &chess::Context) -> ScoredMove {
  let score = piece_score(&board.cells);
  ScoredMove {
    move_info: *move_info,
    eval: chess::scored_move::Eval {
      score: score,
      abs_score: score * context.turn,
      abs_delta: 1,
      path: "path".to_string()
    }
  }
}

fn piece_score (cells: &Vec<Vec<i32>>) -> i32 {
  let ref cells_slice = cells;
  let mut ttl = 0 as i32;
  for row in cells_slice.iter() {
    for cell in row.iter() {
      ttl += *cell;
    }
  }
  ttl
}

pub fn make_scored_move(move_info: &chess::Move, eval: Eval) -> ScoredMove {
  ScoredMove {
    move_info: *move_info,
    eval: eval
  }
}

pub fn get_board_topology(moves: &Vec<chess::Move>) -> BoardTopology {
  let topo_cells = moves.iter().fold(vec![vec![vec![0; 12]; 8]; 8], |mut cells, move_info| {
    let piece_index = (move_info.piece_value + 6) as usize;
    cells[move_info.to_cell[0]][move_info.to_cell[1]][piece_index] += 1;
    cells
  });
  BoardTopology {
    cells: topo_cells
  }
}
