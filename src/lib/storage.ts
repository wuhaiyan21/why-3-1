import type { LevelBestRecord } from './types';

const STORAGE_KEYS = {
  MAX_UNLOCKED_LEVEL: 'mazerunner_max_unlocked_level',
  BEST_RECORDS: 'mazerunner_best_records',
  CUSTOM_SEED: 'mazerunner_custom_seed',
};

const DEFAULT_MAX_UNLOCKED = 1;

export function getMaxUnlockedLevel(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MAX_UNLOCKED_LEVEL);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read max unlocked level:', e);
  }
  return DEFAULT_MAX_UNLOCKED;
}

export function setMaxUnlockedLevel(level: number): void {
  try {
    const current = getMaxUnlockedLevel();
    if (level > current) {
      localStorage.setItem(STORAGE_KEYS.MAX_UNLOCKED_LEVEL, String(level));
    }
  } catch (e) {
    console.warn('Failed to save max unlocked level:', e);
  }
}

export function unlockNextLevel(completedLevel: number, maxLevel: number): number {
  const next = Math.min(completedLevel + 1, maxLevel);
  setMaxUnlockedLevel(next);
  return getMaxUnlockedLevel();
}

export function getBestRecords(): Record<number, LevelBestRecord> {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.BEST_RECORDS);
    if (val) {
      const parsed = JSON.parse(val);
      const result: Record<number, LevelBestRecord> = {};
      for (const key of Object.keys(parsed)) {
        const lvl = parseInt(key, 10);
        if (!isNaN(lvl)) {
          result[lvl] = parsed[key];
        }
      }
      return result;
    }
  } catch (e) {
    console.warn('Failed to read best records:', e);
  }
  return {};
}

export function getBestRecord(level: number): LevelBestRecord {
  const records = getBestRecords();
  return records[level] || { bestTimeMs: null, bestScore: null };
}

export function updateBestRecord(level: number, timeMs: number, score: number): { timeImproved: boolean; scoreImproved: boolean } {
  const records = getBestRecords();
  const current = records[level] || { bestTimeMs: null, bestScore: null };

  let timeImproved = false;
  let scoreImproved = false;

  if (current.bestTimeMs === null || timeMs < current.bestTimeMs) {
    current.bestTimeMs = timeMs;
    timeImproved = true;
  }

  if (current.bestScore === null || score > current.bestScore) {
    current.bestScore = score;
    scoreImproved = true;
  }

  records[level] = current;

  try {
    localStorage.setItem(STORAGE_KEYS.BEST_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save best records:', e);
  }

  return { timeImproved, scoreImproved };
}

export function getCustomSeed(): string {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CUSTOM_SEED);
    return val || '';
  } catch (e) {
    console.warn('Failed to read custom seed:', e);
    return '';
  }
}

export function setCustomSeed(seed: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SEED, seed);
  } catch (e) {
    console.warn('Failed to save custom seed:', e);
  }
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}
