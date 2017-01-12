use rustc_serialize::json::{self};
use ::chess;

pub struct ScoredMove {
  pub move_info: chess::Move,
  pub topology: BoardTopology,
  pub static_eval: Eval,
  pub predictive_eval: Eval
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

pub struct Eval {
  pub score: i32,
  pub abs_score: i32,
  pub abs_delta: i32,
  pub path: String
}

#[derive(RustcEncodable)]
struct BoardTopologyRecord {
  cells: Vec<Vec<Vec<i32>>>
}

#[derive(RustcEncodable)]
struct ScoredMoveRecord {
  simple_move: String,
  static_eval: EvalRecord,
  predictive_eval: EvalRecord
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
    simple_move: format!("{}{}{}{}", num_to_char(scored_move.move_info.from_cell[0]), scored_move.move_info.from_cell[1], num_to_char(scored_move.move_info.to_cell[0]), scored_move.move_info.to_cell[1]),
    static_eval: EvalRecord {
      score: scored_move.static_eval.score,
      abs_score: scored_move.static_eval.abs_score,
      abs_delta: scored_move.static_eval.abs_delta,
      path: scored_move.static_eval.path,
    },
    predictive_eval: EvalRecord {
      score: scored_move.predictive_eval.score,
      abs_score: scored_move.predictive_eval.abs_score,
      abs_delta: scored_move.predictive_eval.abs_delta,
      path: scored_move.predictive_eval.path,
    }
  }).unwrap();

  data
}

