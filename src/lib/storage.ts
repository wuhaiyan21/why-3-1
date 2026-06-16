import type { LevelBestRecord, LevelStats } from './types';

const STORAGE_KEYS = {
  MAX_UNLOCKED_LEVEL: 'mazerunner_max_unlocked_level',
  BEST_RECORDS: 'mazerunner_best_records',
  CUSTOM_SEED: 'mazerunner_custom_seed',
  LEVEL_STATS: 'mazerunner_level_stats',
};

const DEFAULT_MAX_UNLOCKED = 1;

const EXPORT_VERSION = 1;

export interface ExportData {
  version: number;
  maxUnlockedLevel: number;
  bestRecords: Record<number, LevelBestRecord>;
  customSeed: string;
  levelStats: Record<number, LevelStats>;
}

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

export function getLevelStats(level: number): LevelStats {
  const all = getAllLevelStats();
  return all[level] || { clearCount: 0, failCount: 0, lastResult: null, lastTimeMs: null };
}

export function getAllLevelStats(): Record<number, LevelStats> {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.LEVEL_STATS);
    if (val) {
      const parsed = JSON.parse(val);
      const result: Record<number, LevelStats> = {};
      for (const key of Object.keys(parsed)) {
        const lvl = parseInt(key, 10);
        if (!isNaN(lvl)) {
          result[lvl] = parsed[key];
        }
      }
      return result;
    }
  } catch (e) {
    console.warn('Failed to read level stats:', e);
  }
  return {};
}

export function updateLevelStats(level: number, result: 'clear' | 'fail', timeMs: number): void {
  const all = getAllLevelStats();
  const stats = all[level] || { clearCount: 0, failCount: 0, lastResult: null, lastTimeMs: null };

  if (result === 'clear') {
    stats.clearCount++;
  } else {
    stats.failCount++;
  }
  stats.lastResult = result;
  stats.lastTimeMs = timeMs;

  all[level] = stats;

  try {
    localStorage.setItem(STORAGE_KEYS.LEVEL_STATS, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to save level stats:', e);
  }
}

export function exportAllData(): ExportData {
  return {
    version: EXPORT_VERSION,
    maxUnlockedLevel: getMaxUnlockedLevel(),
    bestRecords: getBestRecords(),
    customSeed: getCustomSeed(),
    levelStats: getAllLevelStats(),
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
}

function isValidBestRecord(val: any): val is LevelBestRecord {
  if (!val || typeof val !== 'object') return false;
  if (val.bestTimeMs !== null && typeof val.bestTimeMs !== 'number') return false;
  if (val.bestScore !== null && typeof val.bestScore !== 'number') return false;
  return true;
}

function isValidLevelStats(val: any): val is LevelStats {
  if (!val || typeof val !== 'object') return false;
  if (typeof val.clearCount !== 'number') return false;
  if (typeof val.failCount !== 'number') return false;
  if (val.lastResult !== null && val.lastResult !== 'clear' && val.lastResult !== 'fail') return false;
  if (val.lastTimeMs !== null && typeof val.lastTimeMs !== 'number') return false;
  return true;
}

export function importAndMergeData(jsonString: string): ImportResult {
  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { success: false, message: '无法解析JSON文件，格式不正确' };
  }

  if (!data || typeof data !== 'object') {
    return { success: false, message: '数据格式不正确' };
  }
  if (data.version !== EXPORT_VERSION) {
    return { success: false, message: '数据版本不匹配，无法导入' };
  }
  if (typeof data.maxUnlockedLevel !== 'number' || data.maxUnlockedLevel < 1) {
    return { success: false, message: 'maxUnlockedLevel 字段无效' };
  }
  if (typeof data.customSeed !== 'string') {
    return { success: false, message: 'customSeed 字段无效' };
  }
  if (!data.bestRecords || typeof data.bestRecords !== 'object') {
    return { success: false, message: 'bestRecords 字段无效' };
  }
  if (!data.levelStats || typeof data.levelStats !== 'object') {
    return { success: false, message: 'levelStats 字段无效' };
  }

  for (const key of Object.keys(data.bestRecords)) {
    const lvl = parseInt(key, 10);
    if (isNaN(lvl) || !isValidBestRecord(data.bestRecords[key])) {
      return { success: false, message: `bestRecords 中关卡 ${key} 的数据无效` };
    }
  }

  for (const key of Object.keys(data.levelStats)) {
    const lvl = parseInt(key, 10);
    if (isNaN(lvl) || !isValidLevelStats(data.levelStats[key])) {
      return { success: false, message: `levelStats 中关卡 ${key} 的数据无效` };
    }
  }

  const currentMaxUnlocked = getMaxUnlockedLevel();
  setMaxUnlockedLevel(Math.max(currentMaxUnlocked, data.maxUnlockedLevel));

  const currentRecords = getBestRecords();
  for (const key of Object.keys(data.bestRecords)) {
    const lvl = parseInt(key, 10);
    const imported = data.bestRecords[key] as LevelBestRecord;
    const current = currentRecords[lvl] || { bestTimeMs: null, bestScore: null };

    if (imported.bestTimeMs !== null && (current.bestTimeMs === null || imported.bestTimeMs < current.bestTimeMs)) {
      current.bestTimeMs = imported.bestTimeMs;
    }
    if (imported.bestScore !== null && (current.bestScore === null || imported.bestScore > current.bestScore)) {
      current.bestScore = imported.bestScore;
    }
    currentRecords[lvl] = current;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.BEST_RECORDS, JSON.stringify(currentRecords));
  } catch (e) {
    console.warn('Failed to save merged best records:', e);
  }

  setCustomSeed(data.customSeed);

  const currentStats = getAllLevelStats();
  for (const key of Object.keys(data.levelStats)) {
    const lvl = parseInt(key, 10);
    const imported = data.levelStats[key] as LevelStats;
    const current = currentStats[lvl] || { clearCount: 0, failCount: 0, lastResult: null, lastTimeMs: null };

    current.clearCount += imported.clearCount;
    current.failCount += imported.failCount;

    if (imported.lastResult !== null) {
      current.lastResult = imported.lastResult;
      current.lastTimeMs = imported.lastTimeMs;
    }

    currentStats[lvl] = current;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.LEVEL_STATS, JSON.stringify(currentStats));
  } catch (e) {
    console.warn('Failed to save merged level stats:', e);
  }

  return { success: true, message: '数据导入成功！' };
}
