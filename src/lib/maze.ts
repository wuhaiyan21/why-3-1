import { CellType } from './types';
import type { Position } from './types';
import { SeededRandom } from './seed';

export function generateMaze(rows: number, cols: number, rng?: SeededRandom): CellType[][] {
  const mazeRows = rows * 2 + 1;
  const mazeCols = cols * 2 + 1;
  const maze: CellType[][] = [];

  for (let r = 0; r < mazeRows; r++) {
    maze[r] = [];
    for (let c = 0; c < mazeCols; c++) {
      maze[r][c] = CellType.WALL;
    }
  }

  const visited: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    visited[r] = [];
    for (let c = 0; c < cols; c++) {
      visited[r][c] = false;
    }
  }

  function toMazePos(r: number, c: number): Position {
    return { row: r * 2 + 1, col: c * 2 + 1 };
  }

  const stack: Position[] = [];
  const start: Position = { row: 0, col: 0 };
  visited[0][0] = true;
  const mp = toMazePos(0, 0);
  maze[mp.row][mp.col] = CellType.PATH;
  stack.push(start);

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { row: number; col: number; dr: number; dc: number }[] = [];

    for (const d of directions) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        neighbors.push({ row: nr, col: nc, dr: d.dr, dc: d.dc });
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = rng ? neighbors[rng.nextInt(0, neighbors.length - 1)] : neighbors[Math.floor(Math.random() * neighbors.length)];
    visited[next.row][next.col] = true;

    const wallR = current.row * 2 + 1 + next.dr;
    const wallC = current.col * 2 + 1 + next.dc;
    maze[wallR][wallC] = CellType.PATH;

    const nextMP = toMazePos(next.row, next.col);
    maze[nextMP.row][nextMP.col] = CellType.PATH;
    stack.push({ row: next.row, col: next.col });
  }

  return maze;
}

export function getStartPos(): Position {
  return { row: 1, col: 1 };
}

export function getExitPos(maze: CellType[][]): Position {
  return { row: maze.length - 2, col: maze[0].length - 2 };
}

export function getPathCells(maze: CellType[][]): Position[] {
  const paths: Position[] = [];
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[0].length; c++) {
      if (maze[r][c] === CellType.PATH) {
        paths.push({ row: r, col: c });
      }
    }
  }
  return paths;
}

export function isWalkable(maze: CellType[][], row: number, col: number): boolean {
  if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) return false;
  return maze[row][col] === CellType.PATH;
}
