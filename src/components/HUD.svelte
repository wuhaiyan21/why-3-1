<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import { PowerUpType } from '../lib/types';
  import { formatTime } from '../lib/storage';

  $: level = $gameStore.level;
  $: score = $gameStore.score;
  $: keysCollected = $gameStore.keysCollected;
  $: keysTotal = $gameStore.keysTotal;
  $: multiplier = $gameStore.multiplier;
  $: speedBuff = $gameStore.speedBuff;
  $: invincibleBuff = $gameStore.invincibleBuff;
  $: elapsedMs = $gameStore.elapsedMs;
  $: speedPickups = $gameStore.speedPickups;
  $: invinciblePickups = $gameStore.invinciblePickups;
</script>

<div class="hud">
  <div class="hud-item">
    <span class="label">LEVEL</span>
    <span class="value level-val">{level}</span>
  </div>

  <div class="hud-item">
    <span class="label">TIME</span>
    <span class="value time-val">{formatTime(elapsedMs)}</span>
  </div>

  <div class="hud-item">
    <span class="label">SCORE</span>
    <span class="value score-val">{score}</span>
  </div>

  <div class="hud-item">
    <span class="label">KEYS</span>
    <span class="value keys-val">
      <span class="keys-count">{keysCollected}</span>
      <span class="keys-sep">/</span>
      <span class="keys-total">{keysTotal}</span>
    </span>
  </div>

  <div class="hud-item">
    <span class="label">MULTI</span>
    <span class="value multi-val" class:multi-high={multiplier >= 2}>{multiplier}x</span>
  </div>

  <div class="hud-item pickups">
    <span class="label">PICKUPS</span>
    <div class="pickup-values">
      <span class="pickup-item speed">
        <span class="pickup-icon">⚡</span>
        <span class="pickup-count">{speedPickups}</span>
      </span>
      <span class="pickup-item inv">
        <span class="pickup-icon">🛡</span>
        <span class="pickup-count">{invinciblePickups}</span>
      </span>
    </div>
  </div>

  <div class="hud-item buffs">
    {#if speedBuff}
      <div class="buff speed-buff" style="--stacks: {speedBuff.stacks}">
        <span class="buff-icon">⚡</span>
        <span class="buff-timer">{Math.ceil(speedBuff.remainingMs / 1000)}s</span>
        <span class="buff-stacks">x{speedBuff.stacks}</span>
      </div>
    {/if}
    {#if invincibleBuff}
      <div class="buff invincible-buff" style="--stacks: {invincibleBuff.stacks}">
        <span class="buff-icon">🛡</span>
        <span class="buff-timer">{Math.ceil(invincibleBuff.remainingMs / 1000)}s</span>
        <span class="buff-stacks">x{invincibleBuff.stacks}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .hud {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: rgba(10, 14, 26, 0.9);
    border-bottom: 1px solid rgba(0, 240, 255, 0.15);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
    z-index: 10;
    flex-wrap: wrap;
  }

  .hud-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  .label {
    font-size: 0.55rem;
    color: #556;
    letter-spacing: 0.15em;
    font-family: 'Orbitron', sans-serif;
  }

  .value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.8rem;
    color: #00f0ff;
  }

  .level-val {
    color: #ffd700;
  }

  .time-val {
    color: #00ff88;
    font-size: 0.75rem;
  }

  .score-val {
    color: #00f0ff;
  }

  .keys-val {
    display: flex;
    gap: 0.2rem;
    color: #ffd700;
  }

  .keys-sep {
    opacity: 0.5;
  }

  .multi-val {
    color: #a0a8c0;
    transition: color 0.3s;
  }

  .multi-high {
    color: #ff0066;
    text-shadow: 0 0 10px rgba(255, 0, 102, 0.5);
  }

  .pickups {
    min-width: 90px;
  }

  .pickup-values {
    display: flex;
    gap: 0.5rem;
  }

  .pickup-item {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
  }

  .pickup-item.speed {
    color: #4488ff;
  }

  .pickup-item.inv {
    color: #ffaa00;
  }

  .pickup-icon {
    font-size: 0.8rem;
  }

  .buffs {
    flex-direction: row;
    gap: 0.5rem;
  }

  .buff {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    font-size: 0.7rem;
  }

  .speed-buff {
    background: rgba(68, 136, 255, 0.15);
    border: 1px solid rgba(68, 136, 255, 0.3);
    color: #4488ff;
  }

  .invincible-buff {
    background: rgba(255, 170, 0, 0.15);
    border: 1px solid rgba(255, 170, 0, 0.3);
    color: #ffaa00;
  }

  .buff-icon {
    font-size: 0.8rem;
  }

  .buff-timer {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
  }

  .buff-stacks {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .hud {
      gap: 0.6rem;
      padding: 0.4rem 0.5rem;
    }
    .label {
      font-size: 0.5rem;
    }
    .value {
      font-size: 0.65rem;
    }
    .time-val {
      font-size: 0.6rem;
    }
  }
</style>
