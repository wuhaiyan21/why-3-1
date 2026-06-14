import { CellType, PowerUpType } from './types';
import type { Position, KeyItem, PowerUp, CellType as CT } from './types';
import { getStartPos, getExitPos, getPathCells } from './maze';

export function placeKeys(maze: CT[][], count: number): KeyItem[] {
  const paths = getPathCells(maze);
  const start = getStartPos();
  const exit = getExitPos(maze);

  const filtered = paths.filter(
    (p) =>
      !(p.row === start.row && p.col === start.col) &&
      !(p.row === exit.row && p.col === exit.col)
  );

  shuffle(filtered);

  const keys: KeyItem[] = [];
  for (let i = 0; i < Math.min(count, filtered.length); i++) {
    keys.push({
      position: filtered[i],
      collected: false,
    });
  }
  return keys;
}

export function placePowerUps(maze: CT[][], count: number, existingPositions: Position[]): PowerUp[] {
  const paths = getPathCells(maze);
  const start = getStartPos();
  const exit = getExitPos(maze);

  const usedSet = new Set<string>();
  usedSet.add(`${start.row},${start.col}`);
  usedSet.add(`${exit.row},${exit.col}`);
  for (const p of existingPositions) {
    usedSet.add(`${p.row},${p.col}`);
  }

  const filtered = paths.filter((p) => !usedSet.has(`${p.row},${p.col}`));
  shuffle(filtered);

  const powerUps: PowerUp[] = [];
  for (let i = 0; i < Math.min(count, filtered.length); i++) {
    powerUps.push({
      position: filtered[i],
      type: Math.random() < 0.5 ? PowerUpType.SPEED : PowerUpType.INVINCIBLE,
      collected: false,
    });
  }
  return powerUps;
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
