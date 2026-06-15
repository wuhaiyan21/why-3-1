import { CellType, PowerUpType } from './types';
import type { Position, KeyItem, PowerUp, CellType as CT } from './types';
import { getStartPos, getExitPos, getPathCells } from './maze';
import { SeededRandom } from './seed';

export function placeKeys(maze: CT[][], count: number, rng?: SeededRandom): KeyItem[] {
  const paths = getPathCells(maze);
  const start = getStartPos();
  const exit = getExitPos(maze);

  const filtered = paths.filter(
    (p) =>
      !(p.row === start.row && p.col === start.col) &&
      !(p.row === exit.row && p.col === exit.col)
  );

  const shuffled = rng ? rng.shuffle(filtered) : shuffle(filtered);

  const keys: KeyItem[] = [];
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    keys.push({
      position: shuffled[i],
      collected: false,
    });
  }
  return keys;
}

export function placePowerUps(maze: CT[][], count: number, existingPositions: Position[], rng?: SeededRandom): PowerUp[] {
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
  const shuffled = rng ? rng.shuffle(filtered) : shuffle(filtered);

  const powerUps: PowerUp[] = [];
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const randVal = rng ? rng.next() : Math.random();
    powerUps.push({
      position: shuffled[i],
      type: randVal < 0.5 ? PowerUpType.SPEED : PowerUpType.INVINCIBLE,
      collected: false,
    });
  }
  return powerUps;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
