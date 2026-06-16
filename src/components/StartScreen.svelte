<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '../stores/gameStore';
  import { getMaxUnlockedLevel, getBestRecord, getLevelStats, formatTime, exportAllData, importAndMergeData } from '../lib/storage';
  import type { ImportResult } from '../lib/storage';
  import { LEVEL_CONFIGS } from '../lib/levels';

  let showLevelSelect = false;
  let maxUnlocked = 1;
  let toastMsg = '';
  let toastType: 'success' | 'error' = 'success';
  let toastTimer: ReturnType<typeof setTimeout>;

  onMount(() => {
    maxUnlocked = getMaxUnlockedLevel();
  });

  function showToast(msg: string, type: 'success' | 'error') {
    toastMsg = msg;
    toastType = type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastMsg = ''; }, 3000);
  }

  function selectLevel(level: number) {
    if (level > maxUnlocked) return;
    gameStore.startLevel(level);
  }

  function getLevelInfo(level: number) {
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    const best = getBestRecord(level);
    const stats = getLevelStats(level);
    return {
      config,
      bestTime: best.bestTimeMs,
      bestScore: best.bestScore,
      stats,
    };
  }

  function handleExport() {
    try {
      const data = exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mazerunner_save_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('数据已导出！', 'success');
    } catch {
      showToast('导出失败', 'error');
    }
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const result: ImportResult = importAndMergeData(text);
        if (result.success) {
          maxUnlocked = getMaxUnlockedLevel();
          showToast(result.message, 'success');
        } else {
          showToast(result.message, 'error');
        }
      } catch {
        showToast('读取文件失败', 'error');
      }
    };
    input.click();
  }
</script>

<div class="start-screen">
  <div class="particles">
    {#each Array(20) as _, i}
      <div class="particle" style="--delay: {i * 0.3}s; --x: {Math.random() * 100}%; --y: {Math.random() * 100}%;"></div>
    {/each}
  </div>

  {#if toastMsg}
    <div class="toast" class:success={toastType === 'success'} class:error={toastType === 'error'}>
      {toastMsg}
    </div>
  {/if}

  {#if !showLevelSelect}
    <div class="content">
      <h1 class="title">
        <span class="title-line">MAZE</span>
        <span class="title-line accent">RUNNER</span>
      </h1>

      <div class="instructions">
        <div class="instruction-item">
          <span class="key-icon">↑↓←→</span>
          <span>方向键移动角色</span>
        </div>
        <div class="instruction-item">
          <span class="key-icon">🗝</span>
          <span>收集所有钥匙打开出口</span>
        </div>
        <div class="instruction-item">
          <span class="key-icon">⚡</span>
          <span>加速道具 - 速度提升10秒</span>
        </div>
        <div class="instruction-item">
          <span class="key-icon">🛡</span>
          <span>无敌道具 - 免疫敌人10秒</span>
        </div>
        <div class="instruction-item">
          <span class="key-icon">👻</span>
          <span>躲避巡逻敌人</span>
        </div>
      </div>

      <div class="progress-info">
        <span class="progress-label">最高解锁</span>
        <span class="progress-value">LEVEL {maxUnlocked} / {gameStore.MAX_LEVEL}</span>
      </div>

      <div class="btn-group">
        <button class="start-btn primary" onclick={() => gameStore.startGame()}>
          START GAME
        </button>
        <button class="start-btn secondary" onclick={() => { showLevelSelect = true; maxUnlocked = getMaxUnlockedLevel(); }}>
          SELECT LEVEL
        </button>
      </div>

      <div class="data-btn-group">
        <button class="data-btn export" onclick={handleExport}>
          导出存档
        </button>
        <button class="data-btn import" onclick={handleImport}>
          导入存档
        </button>
      </div>
    </div>
  {:else}
    <div class="content level-select">
      <div class="level-select-header">
        <h2 class="section-title">SELECT LEVEL</h2>
        <button class="back-btn" onclick={() => showLevelSelect = false}>← BACK</button>
      </div>

      <div class="level-grid">
        {#each Array.from({ length: gameStore.MAX_LEVEL }, (_, i) => i + 1) as level}
          {@const info = getLevelInfo(level)}
          {@const unlocked = level <= maxUnlocked}
          <button
            class="level-card"
            class:locked={!unlocked}
            class:unlocked={unlocked}
            onclick={() => selectLevel(level)}
            disabled={!unlocked}
          >
            <div class="level-number">{level}</div>
            <div class="level-name">LEVEL {level}</div>
            {#if !unlocked}
              <div class="lock-icon">🔒</div>
              <div class="lock-text">未解锁</div>
            {:else}
              <div class="level-details">
                <div class="detail-row">
                  <span class="detail-icon">🗝</span>
                  <span>{info.config.keyCount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-icon">👻</span>
                  <span>{info.config.enemyCount}</span>
                </div>
              </div>
              {#if info.bestTime !== null}
                <div class="best-records">
                  <div class="best-row">
                    <span class="best-label">最佳时间</span>
                    <span class="best-value time">{formatTime(info.bestTime)}</span>
                  </div>
                  {#if info.bestScore !== null}
                    <div class="best-row">
                      <span class="best-label">最佳分数</span>
                      <span class="best-value score">{info.bestScore}</span>
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="no-record">暂无记录</div>
              {/if}
              <div class="level-stats">
                <div class="stats-row">
                  <span class="stat-item clear">✓ {info.stats.clearCount}</span>
                  <span class="stat-item fail">✗ {info.stats.failCount}</span>
                </div>
                {#if info.stats.lastResult !== null}
                  <div class="stats-row last-result">
                    <span class="last-label">上次</span>
                    <span class="last-value" class:last-clear={info.stats.lastResult === 'clear'} class:last-fail={info.stats.lastResult === 'fail'}>
                      {info.stats.lastResult === 'clear' ? '通关' : '失败'}
                    </span>
                    {#if info.stats.lastTimeMs !== null}
                      <span class="last-time">{formatTime(info.stats.lastTimeMs)}</span>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <div class="data-btn-group">
        <button class="data-btn export" onclick={handleExport}>
          导出存档
        </button>
        <button class="data-btn import" onclick={handleImport}>
          导入存档
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .start-screen {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 3px;
    height: 3px;
    background: #00f0ff;
    border-radius: 50%;
    opacity: 0;
    animation: float 4s ease-in-out var(--delay) infinite;
  }

  @keyframes float {
    0%, 100% { opacity: 0; transform: translateY(0); }
    50% { opacity: 0.8; transform: translateY(-30px); }
  }

  .toast {
    position: fixed;
    top: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.8rem;
    z-index: 200;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .toast.success {
    background: rgba(0, 255, 136, 0.15);
    border: 1px solid rgba(0, 255, 136, 0.4);
    color: #00ff88;
  }

  .toast.error {
    background: rgba(255, 0, 102, 0.15);
    border: 1px solid rgba(255, 0, 102, 0.4);
    color: #ff0066;
  }

  .content {
    text-align: center;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.8rem;
    max-height: 100vh;
    overflow-y: auto;
    padding: 1rem;
  }

  .content.level-select {
    gap: 1.2rem;
    width: 100%;
    max-width: 900px;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title-line {
    font-family: 'Press Start 2P', cursive;
    font-size: 3rem;
    color: #00f0ff;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3);
    letter-spacing: 0.3em;
  }

  .title-line.accent {
    color: #ff0066;
    text-shadow: 0 0 20px rgba(255, 0, 102, 0.5), 0 0 40px rgba(255, 0, 102, 0.3);
    font-size: 2.5rem;
  }

  .instructions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(20, 24, 50, 0.8);
    border: 1px solid rgba(0, 240, 255, 0.15);
    border-radius: 12px;
    padding: 1.25rem 1.75rem;
    backdrop-filter: blur(10px);
  }

  .instruction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.85rem;
    color: #a0a8c0;
  }

  .key-icon {
    font-size: 1.1rem;
    min-width: 3rem;
    text-align: center;
  }

  .progress-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 1.5rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
  }

  .progress-label {
    font-size: 0.6rem;
    color: #556;
    letter-spacing: 0.15em;
  }

  .progress-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.85rem;
    color: #ffd700;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .start-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 1rem;
    padding: 0.9rem 2.5rem;
    background: transparent;
    border: 2px solid;
    border-radius: 8px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .start-btn.primary {
    color: #00f0ff;
    border-color: #00f0ff;
  }

  .start-btn.primary:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.1);
    transform: scale(1.05);
  }

  .start-btn.secondary {
    color: #ffd700;
    border-color: #ffd700;
    font-size: 0.85rem;
    padding: 0.75rem 2rem;
  }

  .start-btn.secondary:hover {
    background: rgba(255, 215, 0, 0.1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1);
    transform: scale(1.05);
  }

  .start-btn:active {
    transform: scale(0.98);
  }

  .data-btn-group {
    display: flex;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  .data-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    padding: 0.5rem 1.2rem;
    background: transparent;
    border: 1px solid;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: all 0.2s;
  }

  .data-btn.export {
    color: #a0a8c0;
    border-color: rgba(160, 168, 192, 0.3);
  }

  .data-btn.export:hover {
    background: rgba(160, 168, 192, 0.1);
    border-color: rgba(160, 168, 192, 0.6);
  }

  .data-btn.import {
    color: #00f0ff;
    border-color: rgba(0, 240, 255, 0.3);
  }

  .data-btn.import:hover {
    background: rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.6);
  }

  .level-select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 0.5rem;
  }

  .section-title {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.2rem;
    color: #00f0ff;
    letter-spacing: 0.15em;
    text-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
  }

  .back-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    background: transparent;
    color: #a0a8c0;
    border: 1px solid rgba(160, 168, 192, 0.3);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.1em;
  }

  .back-btn:hover {
    background: rgba(160, 168, 192, 0.1);
    color: #e0e0e0;
    border-color: rgba(160, 168, 192, 0.5);
  }

  .level-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    width: 100%;
    padding: 0.5rem;
  }

  .level-card {
    background: rgba(20, 24, 50, 0.8);
    border: 2px solid;
    border-radius: 12px;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.25s;
    backdrop-filter: blur(8px);
    min-height: 180px;
  }

  .level-card.unlocked {
    border-color: rgba(0, 240, 255, 0.3);
  }

  .level-card.unlocked:hover {
    background: rgba(0, 240, 255, 0.08);
    border-color: rgba(0, 240, 255, 0.6);
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 240, 255, 0.2);
  }

  .level-card.locked {
    border-color: rgba(85, 85, 102, 0.3);
    cursor: not-allowed;
    opacity: 0.55;
  }

  .level-number {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.6rem;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  .level-card.locked .level-number {
    color: #556;
    text-shadow: none;
  }

  .level-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    color: #a0a8c0;
    letter-spacing: 0.1em;
  }

  .lock-icon {
    font-size: 1.8rem;
    margin: 0.3rem 0;
  }

  .lock-text {
    font-size: 0.75rem;
    color: #556;
  }

  .level-details {
    display: flex;
    gap: 1rem;
    padding: 0.3rem 0;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #a0a8c0;
  }

  .detail-icon {
    font-size: 0.85rem;
  }

  .best-records {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(0, 240, 255, 0.1);
  }

  .best-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.65rem;
  }

  .best-label {
    color: #556;
  }

  .best-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.6rem;
  }

  .best-value.time {
    color: #00ff88;
  }

  .best-value.score {
    color: #ffd700;
  }

  .no-record {
    font-size: 0.7rem;
    color: #556;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(85, 85, 102, 0.15);
  }

  .level-stats {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
    padding-top: 0.35rem;
    border-top: 1px solid rgba(0, 240, 255, 0.1);
  }

  .stats-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.6rem;
  }

  .stat-item.clear {
    color: #00ff88;
  }

  .stat-item.fail {
    color: #ff0066;
  }

  .stats-row.last-result {
    gap: 0.35rem;
  }

  .last-label {
    color: #556;
    font-size: 0.55rem;
  }

  .last-value {
    font-size: 0.6rem;
    font-weight: 600;
  }

  .last-value.last-clear {
    color: #00ff88;
  }

  .last-value.last-fail {
    color: #ff0066;
  }

  .last-time {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.5rem;
    color: #a0a8c0;
  }

  @media (max-width: 768px) {
    .title-line {
      font-size: 2rem;
    }
    .title-line.accent {
      font-size: 1.7rem;
    }
    .level-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
