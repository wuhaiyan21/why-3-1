import { writable } from 'svelte/store';
import type { GameState, Direction } from '../lib/types';
import { GamePhase } from '../lib/types';
import { createGameState, updateGame, handlePlayerMove, MAX_LEVEL } from '../lib/game';
import { render } from '../lib/renderer';
import { getMaxUnlockedLevel, setCustomSeed as saveCustomSeed, getCustomSeed } from '../lib/storage';

function createGameStore() {
  let state: GameState = {
    phase: GamePhase.START,
    level: 1,
    score: 0,
    levelScore: 0,
    multiplier: 1,
    keysCollected: 0,
    keysTotal: 0,
    speedBuff: null,
    invincibleBuff: null,
    maze: [],
    player: { position: { row: 1, col: 1 }, speed: 1, moveAccumulator: 0, moveCooldown: 0 },
    enemies: [],
    keys: [],
    powerUps: [],
    exitPosition: { row: 1, col: 1 },
    exitOpen: false,
    elapsedMs: 0,
    speedPickups: 0,
    invinciblePickups: 0,
    seed: '',
    customSeed: getCustomSeed(),
    isNewTimeRecord: false,
  };

  const { subscribe, set, update } = writable(state);
  let animFrameId: number | null = null;
  let lastTime: number = 0;
  let canvasRef: HTMLCanvasElement | null = null;
  let animTime = 0;

  function startGame() {
    state = createGameState(1);
    state.score = 0;
    set(state);
    startLoop();
  }

  function startLevel(level: number) {
    const maxUnlocked = getMaxUnlockedLevel();
    const actualLevel = Math.min(Math.max(1, level), maxUnlocked);
    state = createGameState(actualLevel);
    state.score = 0;
    set(state);
    startLoop();
  }

  function nextLevel() {
    const nextLvl = state.level + 1;
    const savedScore = state.score;
    if (nextLvl > MAX_LEVEL) {
      state.phase = GamePhase.ALL_COMPLETE;
      set(state);
      return;
    }
    state = createGameState(nextLvl);
    state.score = savedScore;
    set(state);
    startLoop();
  }

  function retryLevel() {
    const savedScore = state.score - state.levelScore;
    state = createGameState(state.level, state.customSeed);
    state.score = Math.max(0, savedScore);
    set(state);
    startLoop();
  }

  function restartLevelWithSeed(customSeed: string) {
    saveCustomSeed(customSeed);
    const savedScore = state.score - state.levelScore;
    state = createGameState(state.level, customSeed);
    state.score = Math.max(0, savedScore);
    set(state);
    startLoop();
  }

  function updateCustomSeed(customSeed: string) {
    state.customSeed = customSeed;
    set(state);
  }

  function move(dir: Direction) {
    if (state.phase !== GamePhase.PLAYING) return;
    state = handlePlayerMove(state, dir);
    set(state);
  }

  function pause() {
    if (state.phase !== GamePhase.PLAYING) return;
    state = { ...state, phase: GamePhase.PAUSED };
    set(state);
  }

  function resume() {
    if (state.phase !== GamePhase.PAUSED) return;
    state = { ...state, phase: GamePhase.PLAYING };
    lastTime = performance.now();
    set(state);
  }

  function setCanvas(canvas: HTMLCanvasElement) {
    canvasRef = canvas;
  }

  function goToStart() {
    stopLoop();
    state = {
      ...state,
      phase: GamePhase.START,
    };
    set(state);
  }

  function startLoop() {
    lastTime = performance.now();
    animTime = 0;
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function loop(now: number) {
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;
      animTime += delta / 1000;

      if (state.phase === GamePhase.PLAYING) {
        state = updateGame(state, delta);
        set(state);
      }

      if (canvasRef) {
        const ctx = canvasRef.getContext('2d');
        if (ctx) {
          render(ctx, state, canvasRef.width, canvasRef.height, animTime);
        }
      }

      animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  return {
    subscribe,
    startGame,
    startLevel,
    nextLevel,
    retryLevel,
    restartLevelWithSeed,
    updateCustomSeed,
    move,
    pause,
    resume,
    setCanvas,
    startLoop,
    stopLoop,
    goToStart,
    MAX_LEVEL,
  };
}

export const gameStore = createGameStore();
