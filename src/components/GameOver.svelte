<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import { formatTime } from '../lib/storage';

  $: score = $gameStore.score;
  $: level = $gameStore.level;
  $: elapsedMs = $gameStore.elapsedMs;
  $: speedPickups = $gameStore.speedPickups;
  $: invinciblePickups = $gameStore.invinciblePickups;
  $: keysCollected = $gameStore.keysCollected;
  $: keysTotal = $gameStore.keysTotal;
</script>

<div class="overlay">
  <div class="card">
    <div class="icon">💀</div>
    <h2 class="title">GAME OVER</h2>
    <p class="message">被敌人抓到了！</p>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">用时</span>
        <span class="stat-value time">{formatTime(elapsedMs)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总分</span>
        <span class="stat-value score">{score}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">钥匙</span>
        <span class="stat-value">🗝 {keysCollected}/{keysTotal}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">加速道具</span>
        <span class="stat-value speed">⚡ {speedPickups}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">无敌道具</span>
        <span class="stat-value inv">🛡 {invinciblePickups}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">关卡</span>
        <span class="stat-value level">LV {level}</span>
      </div>
    </div>

    <div class="btn-row">
      <button class="menu-btn" onclick={() => gameStore.goToStart()}>
        主菜单
      </button>
      <button class="retry-btn" onclick={() => gameStore.retryLevel()}>
        RETRY
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 0, 102, 0.05);
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
    border: 1px solid rgba(255, 0, 102, 0.3);
    border-radius: 16px;
    padding: 2rem 2.2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 0 40px rgba(255, 0, 102, 0.15);
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
    font-size: 1.15rem;
    color: #ff0066;
    text-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
    letter-spacing: 0.1em;
  }

  .message {
    font-size: 0.85rem;
    color: #a0a8c0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem 1.2rem;
    width: 100%;
    padding: 0.7rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    border: 1px solid rgba(255, 0, 102, 0.1);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
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
    font-size: 0.85rem;
    color: #e0e0e0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .stat-value.time {
    color: #ff0066;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
  }

  .stat-value.score {
    color: #ff0066;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.8rem;
  }

  .stat-value.speed {
    color: #4488ff;
  }

  .stat-value.inv {
    color: #ffaa00;
  }

  .stat-value.level {
    color: #ffd700;
    font-family: 'Press Start 2P', cursive;
    font-size: 0.75rem;
  }

  .btn-row {
    display: flex;
    gap: 0.8rem;
    width: 100%;
  }

  .menu-btn, .retry-btn {
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

  .retry-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.7rem;
    color: #ff0066;
    border-color: #ff0066;
  }

  .retry-btn:hover {
    background: rgba(255, 0, 102, 0.1);
    box-shadow: 0 0 20px rgba(255, 0, 102, 0.3);
    transform: scale(1.03);
  }

  @media (max-width: 480px) {
    .card {
      padding: 1.5rem 1.2rem;
      gap: 0.9rem;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem 0.8rem;
      padding: 0.5rem;
    }
    .btn-row {
      flex-direction: column;
    }
  }
</style>
