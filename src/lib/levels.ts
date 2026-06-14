import type { LevelConfig } from './types';

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, rows: 9, cols: 9, keyCount: 3, enemyCount: 1, powerUpCount: 2, enemySpeed: 0.8 },
  { level: 2, rows: 11, cols: 11, keyCount: 4, enemyCount: 2, powerUpCount: 3, enemySpeed: 0.9 },
  { level: 3, rows: 13, cols: 13, keyCount: 5, enemyCount: 3, powerUpCount: 3, enemySpeed: 1.0 },
  { level: 4, rows: 15, cols: 15, keyCount: 6, enemyCount: 4, powerUpCount: 4, enemySpeed: 1.1 },
  { level: 5, rows: 17, cols: 17, keyCount: 7, enemyCount: 5, powerUpCount: 4, enemySpeed: 1.2 },
];

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.min(level - 1, LEVEL_CONFIGS.length - 1);
  const base = LEVEL_CONFIGS[idx];
  if (level > LEVEL_CONFIGS.length) {
    const extra = level - LEVEL_CONFIGS.length;
    return {
      ...base,
      level,
      rows: base.rows + extra * 2,
      cols: base.cols + extra * 2,
      enemyCount: base.enemyCount + extra,
      keyCount: base.keyCount + extra,
    };
  }
  return base;
}
