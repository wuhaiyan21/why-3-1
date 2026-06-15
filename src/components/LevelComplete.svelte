<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import { formatTime, getBestRecord, getMaxUnlockedLevel } from '../lib/storage';
  import { onMount } from 'svelte';

  $: score = $gameStore.score;
  $: level = $gameStore.level;
  $: elapsedMs = $gameStore.elapsedMs;
  $: speedPickups = $gameStore.speedPickups;
  $: invinciblePickups = $gameStore.invinciblePickups;
  $: keysCollected = $gameStore.keysCollected;
  $: levelScore = $gameStore.levelScore;

  let bestTime: number | null = null;
  let bestScore: number | null = null;
  let nextUnlocked = 1;
  let isNewRecord = false;

  onMount(() => {
    const best = getBestRecord(level);
    bestTime = best.bestTimeMs;
    bestScore = best.bestScore;
    isNewRecord = bestTime !== null && elapsedMs <= bestTime;
    nextUnlocked = getMaxUnlockedLevel();
  });
</script>

<div class="overlay">
  <div class="card">
    <div class="icon">🎉</div>
    <h2 class="title">LEVEL {level} COMPLETE</h2>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">用时</span>
        <span class="stat-value time" class:new-record={isNewRecord}>
          {formatTime(elapsedMs)}
          {#if isNewRecord}
            <span class="record-badge">NEW!</span>
          {/if}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">本关得分</span>
        <span class="stat-value score">{levelScore}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总分</span>
        <span class="stat-value total">{score}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">钥匙</span>
        <span class="stat-value">🗝 {keysCollected}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">加速道具</span>
        <span class="stat-value speed">⚡ {speedPickups}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">无敌道具</span>
        <span class="stat-value inv">🛡 {invinciblePickups}</span>
      </div>
    </div>

    {#if bestTime !== null}
      <div class="best-records">
        <div class="best-title">🏆 最佳纪录</div>
        <div class="best-row">
          <span class="best-label">最快时间</span>
          <span class="best-value time">{formatTime(bestTime)}</span>
        </div>
        {#if bestScore !== null}
          <div class="best-row">
            <span class="best-label">最高分数</span>
            <span class="best-value score">{bestScore}</span>
          </div>
        {/if}
      </div>
    {/if}

    <div class="unlock-info">
      <span class="unlock-text">已解锁关卡：</span>
      <span class="unlock-value">LEVEL {nextUnlocked}</span>
    </div>

    <div class="btn-row">
      <button class="menu-btn" onclick={() => gameStore.goToStart()}>
        主菜单
      </button>
      <button class="next-btn" onclick={() => gameStore.nextLevel()}>
        NEXT LEVEL →
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 255, 136, 0.05);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.3s ease;
    padding: 1rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .card {
    background: rgba(10, 14, 26, 0.95);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 16px;
    padding: 2rem 2.2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    box-shadow: 0 0 40px rgba(0, 255, 136, 0.15), 0 0 80px rgba(0, 255, 136, 0.05);
    animation: scaleIn 0.3s ease;
    max-width: 420px;
    width: 100%;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .icon {
    font-size: 2.8rem;
  }

  .title {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.05rem;
    color: #00ff88;
    text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
    letter-spacing: 0.1em;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.7rem 1.2rem;
    width: 100%;
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 136, 0.1);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    text-align: left;
  }

  .stat-label {
    font-size: 0.6rem;
    color: #556;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem;
    color: #e0e0e0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    position: relative;
  }

  .stat-value.time {
    color: #00ff88;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.75rem;
  }

  .stat-value.time.new-record {
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .stat-value.score {
    color: #00f0ff;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.8rem;
  }

  .stat-value.total {
    color: #ffd700;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.85rem;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  .stat-value.speed {
    color: #4488ff;
  }

  .stat-value.inv {
    color: #ffaa00;
  }

  .record-badge {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.55rem;
    padding: 0.15rem 0.4rem;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.5);
    border-radius: 4px;
    color: #ffd700;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .best-records {
    width: 100%;
    padding: 0.7rem 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .best-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    color: #ffd700;
    letter-spacing: 0.1em;
    margin-bottom: 0.2rem;
  }

  .best-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7rem;
  }

  .best-label {
    color: #a0a8c0;
  }

  .best-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.65rem;
  }

  .best-value.time {
    color: #00ff88;
  }

  .best-value.score {
    color: #ffd700;
  }

  .unlock-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 240, 255, 0.05);
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 8px;
  }

  .unlock-text {
    font-size: 0.7rem;
    color: #a0a8c0;
  }

  .unlock-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
    color: #00f0ff;
  }

  .btn-row {
    display: flex;
    gap: 0.8rem;
    width: 100%;
  }

  .menu-btn, .next-btn {
    flex: 1;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    padding: 0.7rem 1rem;
    background: transparent;
    border: 2px solid;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: all 0.3s;
  }

  .menu-btn {
    color: #a0a8c0;
    border-color: rgba(160, 168, 192, 0.4);
  }

  .menu-btn:hover {
    background: rgba(160, 168, 192, 0.1);
    border-color: rgba(160, 168, 192, 0.6);
  }

  .next-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
    color: #00ff88;
    border-color: #00ff88;
  }

  .next-btn:hover {
    background: rgba(0, 255, 136, 0.1);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    transform: scale(1.03);
  }

  @media (max-width: 480px) {
    .card {
      padding: 1.5rem 1.2rem;
      gap: 1rem;
    }
    .title {
      font-size: 0.9rem;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem 0.8rem;
      padding: 0.6rem;
    }
    .btn-row {
      flex-direction: column;
    }
  }
</style>
