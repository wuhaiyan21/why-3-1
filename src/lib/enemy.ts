import type { Enemy, Position } from './types';
import { CellType } from './types';
import { isWalkable } from './maze';

export function createEnemy(path: Position[], speed: number): Enemy {
  return {
    path,
    currentPathIndex: 0,
    direction: 1,
    position: { ...path[0] },
    speed,
    moveAccumulator: 0,
  };
}

export function updateEnemy(enemy: Enemy, deltaMs: number): void {
  enemy.moveAccumulator += enemy.speed * deltaMs / 1000;
  while (enemy.moveAccumulator >= 1) {
    enemy.moveAccumulator -= 1;
    const nextIndex = enemy.currentPathIndex + enemy.direction;
    if (nextIndex < 0 || nextIndex >= enemy.path.length) {
      enemy.direction = (enemy.direction * -1) as 1 | -1;
      const correctedIndex = enemy.currentPathIndex + enemy.direction;
      if (correctedIndex >= 0 && correctedIndex < enemy.path.length) {
        enemy.currentPathIndex = correctedIndex;
        enemy.position = { ...enemy.path[enemy.currentPathIndex] };
      }
    } else {
      enemy.currentPathIndex = nextIndex;
      enemy.position = { ...enemy.path[enemy.currentPathIndex] };
    }
  }
}

export function findEnemyPaths(maze: CellType[][], count: number): Position[][] {
  const paths: Position[][] = [];
  const pathCells = getAllPathCells(maze);
  const usedCells = new Set<string>();

  for (let i = 0; i < count && pathCells.length > 0; i++) {
    const startIdx = Math.floor(Math.random() * pathCells.length);
    const start = pathCells[startIdx];
    const key = `${start.row},${start.col}`;
    if (usedCells.has(key)) {
      pathCells.splice(startIdx, 1);
      i--;
      continue;
    }

    const path = tracePath(maze, start, usedCells);
    if (path.length >= 3) {
      paths.push(path);
      for (const p of path) {
        usedCells.add(`${p.row},${p.col}`);
      }
    } else {
      pathCells.splice(startIdx, 1);
      i--;
    }

    if (pathCells.length === 0 && paths.length < count) {
      break;
    }
  }

  return paths;
}

function getAllPathCells(maze: CellType[][]): Position[] {
  const cells: Position[] = [];
  for (let r = 1; r < maze.length - 1; r++) {
    for (let c = 1; c < maze[0].length - 1; c++) {
      if (maze[r][c] === CellType.PATH) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

function tracePath(maze: CellType[][], start: Position, usedCells: Set<string>): Position[] {
  const path: Position[] = [start];
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  let current = start;
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  for (let step = 0; step < 20; step++) {
    const neighbors: Position[] = [];
    for (const d of dirs) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      const nk = `${nr},${nc}`;
      if (isWalkable(maze, nr, nc) && !visited.has(nk)) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    if (neighbors.length === 0) break;
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    path.push(next);
    visited.add(`${next.row},${next.col}`);
    current = next;
  }

  return path;
}
