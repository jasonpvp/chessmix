use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  for i in -1..1 {
    for j in -1..1 {
      if cell[0] as i32 + i >= 0 && cell[1] as i32 + j >= 0 {
        let ii = cell[0] + i as usize;
        let jj = cell[1] + j as usize;
        if ii <= 7 && jj <= 7 {
          let occupied = board.cells[ii][jj] != 0;
          let other = chess::pieces::comp::same_color(piece_value, board.cells[ii][jj]);
          moves.push(chess::Move {
            from_cell: cell,
            to_cell: [ii, jj],
            piece_value: piece_value,
            valid: other || !occupied
          });
        }
      }
    }
  }

  moves
}
