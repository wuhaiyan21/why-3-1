import type { GameState, Position, Direction } from './types';
import { GamePhase, CellType, PowerUpType } from './types';
import { generateMaze, getStartPos, getExitPos } from './maze';
import { movePlayer } from './player';
import { createEnemy, updateEnemy, findEnemyPaths } from './enemy';
import { placeKeys, placePowerUps } from './items';
import { applyBuff, tickBuffs, getSpeedMultiplier, isInvincible, getMoveCooldownMs } from './powerup';
import { addScore, increaseMultiplier, resetMultiplier } from './scoring';
import { getLevelConfig } from './levels';
import { SeededRandom, makeLevelSeed } from './seed';
import { getCustomSeed, unlockNextLevel, updateBestRecord, getBestRecord, updateLevelStats } from './storage';

const BASE_MOVE_COOLDOWN_MS = 120;
export const MAX_LEVEL = 5;

export function createGameState(level: number, customSeed?: string): GameState {
  const config = getLevelConfig(level);
  const actualCustomSeed = customSeed !== undefined ? customSeed : getCustomSeed();
  const fullSeed = makeLevelSeed(level, actualCustomSeed);
  const rng = new SeededRandom(fullSeed);

  const maze = generateMaze(config.rows, config.cols, rng);
  const startPos = getStartPos();
  const exitPos = getExitPos(maze);
  const keys = placeKeys(maze, config.keyCount, rng);
  const keyPositions = keys.map((k) => k.position);
  const powerUps = placePowerUps(maze, config.powerUpCount, [
    startPos,
    exitPos,
    ...keyPositions,
  ], rng);

  const enemyPaths = findEnemyPaths(maze, config.enemyCount, rng);
  const enemies = enemyPaths.map((path) => createEnemy(path, config.enemySpeed));

  return {
    phase: GamePhase.PLAYING,
    level,
    score: 0,
    levelScore: 0,
    multiplier: 1,
    keysCollected: 0,
    keysTotal: keys.length,
    speedBuff: null,
    invincibleBuff: null,
    maze,
    player: {
      position: startPos,
      speed: 1,
      moveAccumulator: 0,
      moveCooldown: 0,
    },
    enemies,
    keys,
    powerUps,
    exitPosition: exitPos,
    exitOpen: false,
    elapsedMs: 0,
    speedPickups: 0,
    invinciblePickups: 0,
    seed: fullSeed,
    customSeed: actualCustomSeed,
    isNewTimeRecord: false,
  };
}

export function updateGame(state: GameState, deltaMs: number): GameState {
  if (state.phase !== GamePhase.PLAYING) return state;

  state.elapsedMs += deltaMs;

  const { speedBuff, invincibleBuff } = tickBuffs(state.speedBuff, state.invincibleBuff, deltaMs);
  state.speedBuff = speedBuff;
  state.invincibleBuff = invincibleBuff;

  if (state.player.moveCooldown > 0) {
    state.player.moveCooldown = Math.max(0, state.player.moveCooldown - deltaMs);
  }

  for (const enemy of state.enemies) {
    updateEnemy(enemy, deltaMs);
  }

  checkEnemyCollision(state);

  return state;
}

export function handlePlayerMove(state: GameState, dir: Direction): GameState {
  if (state.phase !== GamePhase.PLAYING) return state;
  if (state.player.moveCooldown > 0) return state;

  const speedMult = getSpeedMultiplier(state.speedBuff);
  const newPos = movePlayer(state.maze, state.player.position, dir, speedMult);
  
  if (newPos.row !== state.player.position.row || newPos.col !== state.player.position.col) {
    state.player.position = newPos;
    state.player.moveCooldown = getMoveCooldownMs(state.speedBuff, BASE_MOVE_COOLDOWN_MS);

    checkKeyPickup(state);
    checkPowerUpPickup(state);
    checkEnemyCollision(state);
    checkExit(state);
  }

  return state;
}

function checkKeyPickup(state: GameState): void {
  for (const key of state.keys) {
    if (!key.collected && key.position.row === state.player.position.row && key.position.col === state.player.position.col) {
      key.collected = true;
      state.keysCollected++;
      addScore(state, 100);

      if (state.keysCollected >= state.keysTotal) {
        state.exitOpen = true;
      }
    }
  }
}

function checkPowerUpPickup(state: GameState): void {
  for (const pu of state.powerUps) {
    if (!pu.collected && pu.position.row === state.player.position.row && pu.position.col === state.player.position.col) {
      pu.collected = true;
      addScore(state, 50);
      increaseMultiplier(state);

      if (pu.type === PowerUpType.SPEED) {
        state.speedBuff = applyBuff(state.speedBuff, PowerUpType.SPEED);
        state.speedPickups++;
      } else {
        state.invincibleBuff = applyBuff(state.invincibleBuff, PowerUpType.INVINCIBLE);
        state.invinciblePickups++;
      }
    }
  }
}

function checkEnemyCollision(state: GameState): void {
  if (state.phase !== GamePhase.PLAYING) return;

  for (const enemy of state.enemies) {
    if (enemy.position.row === state.player.position.row && enemy.position.col === state.player.position.col) {
      if (isInvincible(state.invincibleBuff)) {
        return;
      }
      resetMultiplier(state);
      updateLevelStats(state.level, 'fail', state.elapsedMs);
      state.phase = GamePhase.GAME_OVER;
      return;
    }
  }
}

export interface LevelCompleteResult {
  timeImproved: boolean;
  scoreImproved: boolean;
  nextUnlocked: number;
}

function checkExit(state: GameState): void {
  if (
    state.exitOpen &&
    state.player.position.row === state.exitPosition.row &&
    state.player.position.col === state.exitPosition.col
  ) {
    addScore(state, 500);
    const prevBest = getBestRecord(state.level);
    state.isNewTimeRecord = prevBest.bestTimeMs !== null && state.elapsedMs < prevBest.bestTimeMs;
    updateBestRecord(state.level, state.elapsedMs, state.levelScore);
    updateLevelStats(state.level, 'clear', state.elapsedMs);
    unlockNextLevel(state.level, MAX_LEVEL);
    if (state.level >= MAX_LEVEL) {
      state.phase = GamePhase.ALL_COMPLETE;
    } else {
      state.phase = GamePhase.LEVEL_COMPLETE;
    }
  }
}
