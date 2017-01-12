use ::chess;

pub fn get_moves(board: &chess::Board, piece_value: i32, cell: [usize; 2], dir: [i32; 2]) -> Vec<chess::Move> {
  let mut moves = Vec::new();
  let mut i = cell[0];
  let mut j = cell[1];
  let mut done = false;

  while !done {
    let occupied = board.cells[i][j] != 0;
    let other = chess::pieces::comp::same_color(piece_value, board.cells[i][j]);
    moves.push(chess::Move {
      from_cell: cell,
      to_cell: [i, j],
      piece_value: piece_value,
      valid: other || !occupied
    });

    done = occupied || i <= 0 || i >= 7 || j <= 0 || j >= 7;
    i = i + dir[0] as usize;
    j = j + dir[1] as usize;
  }
  moves
}
