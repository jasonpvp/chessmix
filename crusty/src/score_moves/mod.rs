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
    depth: 0,
    max_depth: 10,
    turn: 1
  };

  let mut board = fen_parser::board_from_fen(fen_str);
  let moves = chess::get_moves(&board, &context);
  board.topology = chess::scored_move::get_board_topology(&moves);

  println!("board string: {}", chess::board_to_ascii(&board));

  let best_move = chess::get_best_move(&board, &moves, context);
  let scored_move_str = CString::new(chess::scored_move::serialize(best_move).to_string()).unwrap();
  score_move_callback(scored_move_str.into_raw());
  thread_id::get()

//  board.moves = chess::board_moves(&board);
//  .iter().fold(vec![], |mut scored_moves, move_info| {
//    let scored_move = chess::scored_move::ScoredMove {
//      move_info: *move_info,
//      topology: chess::scored_move::BoardTopology::new(),
//      static_eval: chess::scored_move::Eval {
//        score: 1,
//        abs_score: 1,
//        abs_delta: 1,
//        path: "path".to_string()
//      },
//      predictive_eval: chess::scored_move::Eval {
//        score: 1,
//        abs_score: 1,
//        abs_delta: 1,
//        path: "path".to_string()
//      }
//    };
//    scored_moves.push(scored_move);
//    scored_moves
//  });

//  let smove = chess::scored_move::ScoredMove {
//    move_info: chess::Move {
//      from_cell: [0, 1],
//      to_cell: [3, 2],
//      piece_value: 3,
//      valid: false
//    },
//    topology: chess::scored_move::BoardTopology::new(),
//    static_eval: chess::scored_move::Eval {
//      score: 1,
//      abs_score: 1,
//      abs_delta: 1,
//      path: "path".to_string()
//    },
//    predictive_eval: chess::scored_move::Eval {
//      score: 1,
//      abs_score: 1,
//      abs_delta: 1,
//      path: "path".to_string()
//    }
//  };
}


