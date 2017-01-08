use rustc_serialize::json::{self};

pub struct ScoredMove {
  pub simple_move: String,
  pub static_eval: Eval,
  pub predictive_eval: Eval
}

pub struct Eval {
  pub score: i32,
  pub abs_score: i32,
  pub abs_delta: i32,
  pub path: String
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

pub fn serialize(scored_move: ScoredMove) -> String {
  let data: String = json::encode(&ScoredMoveRecord {
    simple_move: scored_move.simple_move,
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

