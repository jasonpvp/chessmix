
### Scoring of moves
- statically score each next move
- sort from best to worst for the player whose turn it is at that depth
- recurse on each move

- if depth > 1 && path is leading to deficite, prune branch
- recurse to maxDepth
- minimax in reverse
- each time a root move is scored, re-select the best move

- use tactics to influence which branches to explore
  - current it explores the best scores
  - chance fork on next move means explore
