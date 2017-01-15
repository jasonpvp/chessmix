extern crate libc;
extern crate thread_id;

use self::libc::{c_char};
use std::ffi::CStr;
use std::str;
use std::ffi::CString;

use chess;
use fen_parser;

#[no_mangle]
pub extern fn score_moves(fen: *const c_char, score_move_callback: extern fn(*const c_char)) -> usize {
  let c_str = unsafe {
      assert!(!fen.is_null());
      CStr::from_ptr(fen)
  };

  let fen_str = c_str.to_str().unwrap().to_string();
  let context = chess::Context {
    depth: 1,
    max_depth: 5,
    player: 1,
    turn: 1,
    path: Vec::new()
  };

  let mut board = fen_parser::board_from_fen(fen_str);
  let moves = chess::get_moves(&board, &context);
  board.topology = chess::scored_move::get_board_topology(&moves);

  println!("Current board: {}", chess::board_to_ascii(&board));

  let best_move = chess::get_best_move(&board, &moves, &context);

  for (i, hop) in best_move.path.iter().enumerate() {
    let m = chess::Move {from_cell: hop[0], to_cell: hop[1], piece_value: 0 as i32, valid: true};
    board.cells = chess::make_move(&board.cells, &m);
    println!("Move {} ({},{})-({},{}): {}\n", i, hop[0][0], hop[0][1], hop[1][0], hop[1][1], chess::board_to_ascii(&board));
  }

  let scored_move_str = CString::new(chess::scored_move::serialize(best_move).to_string()).unwrap();
  score_move_callback(scored_move_str.into_raw());

  thread_id::get()
}


