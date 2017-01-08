extern crate libc;
extern crate thread_id;
extern crate rustc_serialize;

use libc::{c_char};
use std::ffi::CStr;
use std::str;
use std::ffi::CString;

mod scored_move;

#[no_mangle]
pub extern fn score_moves(fen: *const c_char, score_move_callback: extern fn(*const c_char)) -> usize {
  let c_str = unsafe {
      assert!(!fen.is_null());
      CStr::from_ptr(fen)
  };

  let r_str = c_str.to_str().unwrap();
  // r_str.chars().count() as int32_t
  let smove = scored_move::ScoredMove {
    simple_move: "a1b1".to_string(),
    static_eval: scored_move::Eval {
      score: 1,
      abs_score: 1,
      abs_delta: 1,
      path: "path".to_string()
    },
    predictive_eval: scored_move::Eval {
      score: 1,
      abs_score: 1,
      abs_delta: 1,
      path: "path".to_string()
    }
  };

  let c_str = CString::new(scored_move::serialize(smove).to_string()).unwrap();
  score_move_callback(c_str.into_raw());
  thread_id::get()
}


