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
  const usedStartCells = new Set<string>();
  const startKey = `${1},${1}`;
  const exitKey = `${maze.length - 2},${maze[0].length - 2}`;
  usedStartCells.add(startKey);
  usedStartCells.add(exitKey);

  let attempts = 0;
  const maxAttempts = count * 20;

  while (paths.length < count && attempts < maxAttempts) {
    attempts++;
    
    const availableStarts = pathCells.filter(p => !usedStartCells.has(`${p.row},${p.col}`));
    if (availableStarts.length === 0) break;

    const start = availableStarts[Math.floor(Math.random() * availableStarts.length)];
    const path = tracePath(maze, start, usedStartCells);
    
    if (path.length >= 3) {
      paths.push(path);
      usedStartCells.add(`${path[0].row},${path[0].col}`);
    }
  }

  while (paths.length < count) {
    const availableStarts = pathCells.filter(p => !usedStartCells.has(`${p.row},${p.col}`));
    if (availableStarts.length === 0) {
      const start = pathCells[Math.floor(Math.random() * pathCells.length)];
      const path = tracePath(maze, start, new Set());
      if (path.length >= 2) {
        paths.push(path);
      } else {
        paths.push([start, start]);
      }
    } else {
      const start = availableStarts[Math.floor(Math.random() * availableStarts.length)];
      const path = tracePath(maze, start, new Set());
      if (path.length >= 2) {
        paths.push(path);
      } else {
        paths.push([start, start]);
      }
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

function tracePath(maze: CellType[][], start: Position, usedStartCells: Set<string>): Position[] {
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

  for (let step = 0; step < 15; step++) {
    const neighbors: Position[] = [];
    for (const d of dirs) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      const nk = `${nr},${nc}`;
      if (isWalkable(maze, nr, nc) && !visited.has(nk) && !usedStartCells.has(nk)) {
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
