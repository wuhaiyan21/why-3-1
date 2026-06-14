<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import { PowerUpType } from '../lib/types';

  $: level = $gameStore.level;
  $: score = $gameStore.score;
  $: keysCollected = $gameStore.keysCollected;
  $: keysTotal = $gameStore.keysTotal;
  $: multiplier = $gameStore.multiplier;
  $: speedBuff = $gameStore.speedBuff;
  $: invincibleBuff = $gameStore.invincibleBuff;
</script>

<div class="hud">
  <div class="hud-item">
    <span class="label">LEVEL</span>
    <span class="value level-val">{level}</span>
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
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(10, 14, 26, 0.9);
    border-bottom: 1px solid rgba(0, 240, 255, 0.15);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
    z-index: 10;
  }

  .hud-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .label {
    font-size: 0.6rem;
    color: #556;
    letter-spacing: 0.15em;
    font-family: 'Orbitron', sans-serif;
  }

  .value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.9rem;
    color: #00f0ff;
  }

  .level-val {
    color: #ffd700;
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

  .buffs {
    flex-direction: row;
    gap: 0.5rem;
  }

  .buff {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
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
    font-size: 0.9rem;
  }

  .buff-timer {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
  }

  .buff-stacks {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.6rem;
    opacity: 0.8;
  }
</style>
