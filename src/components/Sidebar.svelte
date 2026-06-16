<script lang="ts">
  import { gameStore } from '../stores/gameStore';
  import { GamePhase } from '../lib/types';

  let sidebarOpen = false;

  $: level = $gameStore.level;
  $: customSeed = $gameStore.customSeed;
  $: seed = $gameStore.seed;
  $: elapsedMs = $gameStore.elapsedMs;
  $: isPaused = $gameStore.phase === GamePhase.PAUSED;

  let localSeed = '';
  $: if (sidebarOpen) localSeed = customSeed;

  function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  }

  function applySeed() {
    if (isPaused) return;
    gameStore.restartLevelWithSeed(localSeed);
    sidebarOpen = false;
  }

  function resetSeed() {
    if (isPaused) return;
    localSeed = '';
    gameStore.restartLevelWithSeed('');
    sidebarOpen = false;
  }

  function backToMenu() {
    gameStore.goToStart();
    sidebarOpen = false;
  }

  function restartLevel() {
    if (isPaused) return;
    gameStore.restartLevelWithSeed(localSeed);
    sidebarOpen = false;
  }
</script>

<div class="sidebar-wrapper">
  <button class="toggle-btn" onclick={() => sidebarOpen = !sidebarOpen}>
    {sidebarOpen ? '✕' : '☰'}
  </button>

  <div class="sidebar" class:open={sidebarOpen}>
    <div class="sidebar-header">
      <h3 class="sidebar-title">SETTINGS</h3>
    </div>

    <div class="sidebar-section">
      <div class="section-label">当前关卡</div>
      <div class="section-value">LEVEL {level}</div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">已用时间</div>
      <div class="section-value time">{formatTime(elapsedMs)}</div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">关卡种子</div>
      <div class="seed-display" title={seed}>
        {seed || '未生成'}
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">自定义种子</div>
      <input
        type="text"
        class="seed-input"
        placeholder={isPaused ? '暂停中不可修改' : '输入自定义种子...'}
        bind:value={localSeed}
        disabled={isPaused}
        onkeydown={(e) => {
          if (e.key === 'Enter') applySeed();
        }}
      />
      <div class="btn-row">
        <button class="action-btn primary" onclick={applySeed} disabled={isPaused}>
          应用并重开
        </button>
        <button class="action-btn secondary" onclick={resetSeed} disabled={isPaused}>
          重置
        </button>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">操作</div>
      <div class="btn-column">
        <button class="action-btn warn" onclick={restartLevel} disabled={isPaused}>
          重新开始本关
        </button>
        <button class="action-btn ghost" onclick={backToMenu}>
          返回主菜单
        </button>
      </div>
    </div>

    <div class="sidebar-footer">
      <span class="footer-text">种子相同 → 迷宫/敌人/道具相同</span>
    </div>
  </div>

  {#if sidebarOpen}
    <div
      class="overlay-bg"
      role="button"
      tabindex="0"
      onclick={() => sidebarOpen = false}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') sidebarOpen = false; }}
    ></div>
  {/if}
</div>

<style>
  .sidebar-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 50;
  }

  .toggle-btn {
    position: fixed;
    top: 70px;
    right: 12px;
    width: 40px;
    height: 40px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 8px;
    color: #00f0ff;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 51;
  }

  .toggle-btn:hover {
    background: rgba(0, 240, 255, 0.2);
    transform: scale(1.05);
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: -320px;
    width: 300px;
    height: 100vh;
    background: rgba(10, 14, 26, 0.98);
    border-left: 1px solid rgba(0, 240, 255, 0.2);
    padding: 60px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    transition: right 0.3s ease;
    z-index: 52;
    backdrop-filter: blur(12px);
  }

  .sidebar.open {
    right: 0;
  }

  .overlay-bg {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 51;
  }

  .sidebar-header {
    border-bottom: 1px solid rgba(0, 240, 255, 0.15);
    padding-bottom: 0.8rem;
  }

  .sidebar-title {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.85rem;
    color: #00f0ff;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .section-label {
    font-size: 0.65rem;
    color: #556;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .section-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.9rem;
    color: #e0e0e0;
  }

  .section-value.time {
    color: #ffd700;
  }

  .seed-display {
    font-family: 'Orbitron', monospace;
    font-size: 0.75rem;
    color: #a0a8c0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 240, 255, 0.1);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    word-break: break-all;
    max-height: 60px;
    overflow: auto;
  }

  .seed-input {
    font-family: 'Orbitron', monospace;
    font-size: 0.85rem;
    color: #e0e0e0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 6px;
    padding: 0.6rem 0.8rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .seed-input:focus {
    border-color: #00f0ff;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
  }

  .seed-input::placeholder {
    color: #556;
  }

  .btn-row {
    display: flex;
    gap: 0.5rem;
  }

  .btn-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    flex: 1;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.05em;
    border: 1px solid;
  }

  .action-btn.primary {
    background: rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.4);
    color: #00f0ff;
  }

  .action-btn.primary:hover {
    background: rgba(0, 240, 255, 0.2);
    transform: translateY(-1px);
  }

  .action-btn.secondary {
    background: rgba(160, 168, 192, 0.05);
    border-color: rgba(160, 168, 192, 0.3);
    color: #a0a8c0;
  }

  .action-btn.secondary:hover {
    background: rgba(160, 168, 192, 0.1);
  }

  .action-btn.warn {
    background: rgba(255, 170, 0, 0.1);
    border-color: rgba(255, 170, 0, 0.4);
    color: #ffaa00;
  }

  .action-btn.warn:hover {
    background: rgba(255, 170, 0, 0.2);
    transform: translateY(-1px);
  }

  .action-btn.ghost {
    background: transparent;
    border-color: rgba(255, 0, 102, 0.3);
    color: #ff0066;
  }

  .action-btn.ghost:hover {
    background: rgba(255, 0, 102, 0.1);
    transform: translateY(-1px);
  }

  .action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }

  .action-btn:disabled:hover {
    transform: none;
    background: transparent;
  }

  .seed-input:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .sidebar-footer {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 240, 255, 0.1);
  }

  .footer-text {
    font-size: 0.65rem;
    color: #556;
    text-align: center;
    line-height: 1.5;
  }
</style>
