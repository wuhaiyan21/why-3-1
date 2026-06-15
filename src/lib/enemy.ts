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

  const protectedRadius = 3;
  for (let dr = -protectedRadius; dr <= protectedRadius; dr++) {
    for (let dc = -protectedRadius; dc <= protectedRadius; dc++) {
      usedStartCells.add(`${1 + dr},${1 + dc}`);
      usedStartCells.add(`${maze.length - 2 + dr},${maze[0].length - 2 + dc}`);
    }
  }

  const candidateStarts = pathCells.filter(p => !usedStartCells.has(`${p.row},${p.col}`));
  shuffleArray(candidateStarts);

  for (const start of candidateStarts) {
    if (paths.length >= count) break;
    
    const startKey = `${start.row},${start.col}`;
    if (usedStartCells.has(startKey)) continue;

    const path = findLongestPath(maze, start, usedStartCells);
    
    if (path.length >= 3) {
      paths.push(path);
      usedStartCells.add(startKey);
      for (const p of path) {
        usedStartCells.add(`${p.row},${p.col}`);
      }
    }
  }

  while (paths.length < count) {
    const available = pathCells.filter(p => !usedStartCells.has(`${p.row},${p.col}`));
    if (available.length === 0) {
      const fallbackStart = pathCells[Math.floor(Math.random() * pathCells.length)];
      const fallbackPath = findTwoStepPath(maze, fallbackStart);
      paths.push(fallbackPath);
      usedStartCells.add(`${fallbackStart.row},${fallbackStart.col}`);
    } else {
      const start = available[Math.floor(Math.random() * available.length)];
      const path = findTwoStepPath(maze, start);
      paths.push(path);
      usedStartCells.add(`${start.row},${start.col}`);
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

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function findLongestPath(maze: CellType[][], start: Position, blocked: Set<string>): Position[] {
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  let bestPath: Position[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  function dfs(current: Position, path: Position[]): void {
    if (path.length > bestPath.length) {
      bestPath = [...path];
    }
    if (path.length >= 8) return;

    const neighbors: { dr: number; dc: number }[] = [];
    for (const d of dirs) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      const nk = `${nr},${nc}`;
      if (isWalkable(maze, nr, nc) && !visited.has(nk) && !blocked.has(nk)) {
        neighbors.push(d);
      }
    }

    shuffleArray(neighbors);

    for (const d of neighbors) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      const nk = `${nr},${nc}`;
      visited.add(nk);
      path.push({ row: nr, col: nc });
      dfs({ row: nr, col: nc }, path);
      path.pop();
      visited.delete(nk);
    }
  }

  dfs(start, [start]);
  return bestPath;
}

function findTwoStepPath(maze: CellType[][], start: Position): Position[] {
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const d of dirs) {
    const nr = start.row + d.dr;
    const nc = start.col + d.dc;
    if (isWalkable(maze, nr, nc)) {
      return [start, { row: nr, col: nc }];
    }
  }

  return [start, { row: start.row, col: start.col + 1 }];
}
