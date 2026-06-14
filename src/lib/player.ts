import type { Position, Direction } from './types';
import type { CellType } from './types';
import { isWalkable } from './maze';

export function movePlayer(
  maze: CellType[][],
  pos: Position,
  dir: Direction,
  speedMultiplier: number
): Position {
  const deltas: Record<Direction, { dr: number; dc: number }> = {
    up: { dr: -1, dc: 0 },
    down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 },
    right: { dr: 0, dc: 1 },
  };

  const d = deltas[dir];
  const nr = pos.row + d.dr;
  const nc = pos.col + d.dc;

  if (isWalkable(maze, nr, nc)) {
    return { row: nr, col: nc };
  }
  return pos;
}
