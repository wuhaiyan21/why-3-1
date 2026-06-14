export interface Position {
  row: number;
  col: number;
}

export enum CellType {
  WALL = 0,
  PATH = 1,
}

export enum PowerUpType {
  SPEED = 'speed',
  INVINCIBLE = 'invincible',
}

export interface KeyItem {
  position: Position;
  collected: boolean;
}

export interface PowerUp {
  position: Position;
  type: PowerUpType;
  collected: boolean;
}

export interface Enemy {
  path: Position[];
  currentPathIndex: number;
  direction: 1 | -1;
  position: Position;
  speed: number;
  moveAccumulator: number;
}

export interface Player {
  position: Position;
  speed: number;
  moveAccumulator: number;
}

export interface ActiveBuff {
  type: PowerUpType;
  stacks: number;
  remainingMs: number;
  maxStacks: number;
}

export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  keyCount: number;
  enemyCount: number;
  powerUpCount: number;
  enemySpeed: number;
}

export enum GamePhase {
  START = 'start',
  PLAYING = 'playing',
  LEVEL_COMPLETE = 'level_complete',
  GAME_OVER = 'game_over',
  ALL_COMPLETE = 'all_complete',
}

export interface GameState {
  phase: GamePhase;
  level: number;
  score: number;
  levelScore: number;
  multiplier: number;
  keysCollected: number;
  keysTotal: number;
  speedBuff: ActiveBuff | null;
  invincibleBuff: ActiveBuff | null;
  maze: CellType[][];
  player: Player;
  enemies: Enemy[];
  keys: KeyItem[];
  powerUps: PowerUp[];
  exitPosition: Position;
  exitOpen: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
