import type { GameState } from './types';

export function addScore(state: GameState, base: number): number {
  const gained = Math.round(base * state.multiplier);
  state.score += gained;
  state.levelScore += gained;
  return gained;
}

export function increaseMultiplier(state: GameState): void {
  state.multiplier += 0.5;
}

export function resetMultiplier(state: GameState): void {
  state.multiplier = 1;
}
