use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in -1..1 {
    for j in -1..1 {
      if cell[0] as i32 + i >= 0 && cell[1] as i32 + j >= 0 {
        let ii = cell[0] + i as usize;
        let jj = cell[1] + j as usize;
        if ii <= 7 && jj <= 7 {
          let occupied = board.cells[ii][jj] != 0;
          let other = !chess::pieces::comp::same_color(piece_value, board.cells[ii][jj]);
          let capture = other && occupied;
          moves.push(chess::Move {
            from_cell: cell,
            to_cell: [ii, jj],
            piece_value: piece_value,
            valid: piece_turn && (other || !occupied),
            capture: capture,
            capture_diff: if capture { (board.cells[ii][jj]).abs() - piece_value.abs() } else { 0 },
            capture_value: if capture { (board.cells[ii][jj]).abs() } else { 0 }
          });
        }
      }
    }
  }

  moves
}
