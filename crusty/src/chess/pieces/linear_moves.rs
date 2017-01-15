use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, piece_turn: bool, cell: [usize; 2], dir: [i32; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  let mut i = cell[0] as i32 + dir[0];
  let mut j = cell[1] as i32 + dir[1];
  let mut done = i < 0 || i > 7 || j < 0 || j > 7;

  while !done {
    let ii = i as usize;
    let jj = j as usize;
    let occupied = board.cells[ii][jj] != 0;
    let other = !chess::pieces::comp::same_color(piece_value, board.cells[ii][jj]);

    moves.push(chess::Move {
      from_cell: cell,
      to_cell: [ii, jj],
      piece_value: piece_value,
      valid: piece_turn && (other || !occupied)
    });

    done = is_done(occupied, i, j);
    i += dir[0];
    j += dir[1];
  }
  moves
}

fn is_done(occupied: bool, i: i32, j: i32) -> bool {
  occupied || i <= 0 || i >= 7 || j <= 0 || j >= 7
}
