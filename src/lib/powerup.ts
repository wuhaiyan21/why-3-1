import { PowerUpType } from './types';
import type { ActiveBuff } from './types';

const BASE_DURATION_MS = 10000;
const EXTRA_DURATION_MS = 5000;
const MAX_STACKS = 3;

export function applyBuff(
  existing: ActiveBuff | null,
  type: PowerUpType
): ActiveBuff {
  if (existing && existing.type === type) {
    const newStacks = Math.min(existing.stacks + 1, MAX_STACKS);
    const addedTime = existing.stacks >= MAX_STACKS ? 0 : EXTRA_DURATION_MS;
    return {
      type,
      stacks: newStacks,
      remainingMs: existing.remainingMs + addedTime,
      maxStacks: MAX_STACKS,
    };
  }

  return {
    type,
    stacks: 1,
    remainingMs: BASE_DURATION_MS,
    maxStacks: MAX_STACKS,
  };
}

export function tickBuffs(
  speedBuff: ActiveBuff | null,
  invincibleBuff: ActiveBuff | null,
  deltaMs: number
): { speedBuff: ActiveBuff | null; invincibleBuff: ActiveBuff | null } {
  return {
    speedBuff: tickBuff(speedBuff, deltaMs),
    invincibleBuff: tickBuff(invincibleBuff, deltaMs),
  };
}

function tickBuff(buff: ActiveBuff | null, deltaMs: number): ActiveBuff | null {
  if (!buff) return null;
  const remaining = buff.remainingMs - deltaMs;
  if (remaining <= 0) return null;
  return { ...buff, remainingMs: remaining };
}

export function getSpeedMultiplier(buff: ActiveBuff | null): number {
  if (!buff) return 1;
  return 1 + 0.6 * buff.stacks;
}

export function getMoveCooldownMs(buff: ActiveBuff | null, baseCooldown: number): number {
  if (!buff) return baseCooldown;
  const reductionPerStack = 0.25;
  const reduction = Math.min(reductionPerStack * buff.stacks, 0.75);
  return Math.max(30, baseCooldown * (1 - reduction));
}

export function isInvincible(buff: ActiveBuff | null): boolean {
  return buff !== null && buff.remainingMs > 0;
}
