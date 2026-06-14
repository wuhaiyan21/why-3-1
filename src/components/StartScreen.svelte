<script lang="ts">
  import { gameStore } from '../stores/gameStore';
</script>

<div class="start-screen">
  <div class="particles">
    {#each Array(20) as _, i}
      <div class="particle" style="--delay: {i * 0.3}s; --x: {Math.random() * 100}%; --y: {Math.random() * 100}%;"></div>
    {/each}
  </div>

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

    <button class="start-btn" onclick={() => gameStore.startGame()}>
      START GAME
    </button>
  </div>
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

  .content {
    text-align: center;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
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
    padding: 1.5rem 2rem;
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

  .start-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.1rem;
    padding: 1rem 3rem;
    background: transparent;
    color: #00f0ff;
    border: 2px solid #00f0ff;
    border-radius: 8px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .start-btn:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.1);
    transform: scale(1.05);
  }

  .start-btn:active {
    transform: scale(0.98);
  }
</style>
