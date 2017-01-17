use rustc_serialize::json::{self};
use ::chess;
mod topology;

#[derive(Clone)]
pub struct ScoredMove {
  pub move_info: chess::Move,
  pub eval: Eval,
  pub path: Vec<[[usize; 2]; 2]>
}

pub struct BoardTopology {
  pub cells: Vec<Vec<Vec<i32>>>
}

impl BoardTopology {
  pub fn new () -> BoardTopology {
    BoardTopology {
      cells: vec![vec![Vec::new(); 8]; 8]
    }
  }
}

#[derive(Clone)]
pub struct Eval {
  pub score: f32,
  pub abs_score: f32,
  pub abs_delta: f32,
  pub player_in_check: bool,
  pub opponent_in_check: bool,
  pub in_checkmate: bool
}

//#[derive(RustcEncodable)]
//struct BoardTopologyRecord {
//  cells: Vec<Vec<Vec<i32>>>
//}

#[derive(RustcEncodable)]
struct ScoredMoveRecord {
  simple_move: String,
  eval: EvalRecord,
  path: String
}

#[derive(RustcEncodable)]
struct EvalRecord {
  score: f32,
  abs_score: f32,
  abs_delta: f32,
  player_in_check: bool,
  opponent_in_check: bool,
  in_checkmate: bool
}

fn num_to_char(n: usize) -> char {
  (n + 97) as u8 as char
}

pub fn serialize(scored_move: ScoredMove) -> String {
  let data: String = json::encode(&ScoredMoveRecord {
    simple_move: format!("{}{}{}{}", num_to_char(scored_move.move_info.from_cell[1]), scored_move.move_info.from_cell[0] + 1, num_to_char(scored_move.move_info.to_cell[1]), scored_move.move_info.to_cell[0] + 1),
    path: path_str(scored_move.path),
    eval: EvalRecord {
      score: scored_move.eval.score,
      abs_score: scored_move.eval.abs_score,
      abs_delta: scored_move.eval.abs_delta,
      player_in_check: scored_move.eval.player_in_check,
      opponent_in_check: scored_move.eval.opponent_in_check,
      in_checkmate: scored_move.eval.in_checkmate
    }
  }).unwrap();

  data
}

fn path_str(path: Vec<[[usize; 2]; 2]>) -> String {
  let mut ps = "".to_owned();
  for hop in path.iter() {
    ps = format!("{}, ({},{})-({},{})", ps, hop[0][0], hop[0][1], hop[1][0], hop[1][1]);
  }
  ps
}

pub fn get_scored_move(move_info: &chess::Move, board: &chess::Board, context: &chess::Context) -> ScoredMove {
  let (mut score, player_in_check, opponent_in_check) = topology::get_topology_score(board, context);
  score += piece_score(&board.cells, context);

  let mut path = context.path.to_owned();
  path.push([move_info.from_cell, move_info.to_cell]);
  let ps = path_str(path.clone());

  ScoredMove {
    move_info: *move_info,
    path: path,
    eval: chess::scored_move::Eval {
      score: score,
      abs_score: score * context.player as f32,
      abs_delta: 1.0,
      player_in_check: player_in_check,
      opponent_in_check: opponent_in_check,
      in_checkmate: false
    }
  }
}

fn piece_score (cells: &Vec<Vec<i32>>, context: &chess::Context) -> f32 {
  let ref cells_slice = cells;
  let mut ttl = 0 as i32;
  for row in cells_slice.iter() {
    for cell in row.iter() {
      ttl += chess::constants::piece_weight(*cell, context.depth);
    }
  }
  ttl as f32
}

pub fn make_scored_move(move_info: &chess::Move, scored_move: &ScoredMove) -> ScoredMove {
  ScoredMove {
    move_info: *move_info,
    path: scored_move.path.to_owned(),
    eval: scored_move.eval.clone()
  }
}

pub fn get_board_topology(moves: &Vec<chess::Move>) -> BoardTopology {
  let topo_cells = moves.iter().fold(vec![vec![Vec::new(); 8]; 8], |mut cells, move_info| {
    cells[move_info.to_cell[0]][move_info.to_cell[1]].push(move_info.piece_value);
    cells
  });
  BoardTopology {
    cells: topo_cells
  }
}
