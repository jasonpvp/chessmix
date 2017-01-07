extern crate libc;
extern crate thread_id;

use libc::{c_char, int32_t};
use std::ffi::CStr;
use std::str;

#[no_mangle]
pub extern fn score_moves(fen: *const c_char, score_move_callback: extern fn(int32_t)) -> int32_t {
  let c_str = unsafe {
      assert!(!fen.is_null());
      CStr::from_ptr(fen)
  };

  let r_str = c_str.to_str().unwrap();
  score_move_callback(r_str.chars().count() as int32_t);
  1
}

#[no_mangle]
pub extern fn thread_id() -> usize {
  thread_id::get()
}
