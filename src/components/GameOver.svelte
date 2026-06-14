<script lang="ts">
  import { gameStore } from '../stores/gameStore';

  $: score = $gameStore.score;
  $: level = $gameStore.level;
</script>

<div class="overlay">
  <div class="card">
    <div class="icon">💀</div>
    <h2 class="title">GAME OVER</h2>
    <p class="message">被敌人抓到了！</p>
    <div class="score-display">
      <span class="score-label">SCORE</span>
      <span class="score-value">{score}</span>
    </div>
    <button class="retry-btn" onclick={() => gameStore.retryLevel()}>
      RETRY
    </button>
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
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .card {
    background: rgba(10, 14, 26, 0.95);
    border: 1px solid rgba(255, 0, 102, 0.3);
    border-radius: 16px;
    padding: 2.5rem 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    box-shadow: 0 0 40px rgba(255, 0, 102, 0.15);
    animation: scaleIn 0.3s ease;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .icon {
    font-size: 3rem;
  }

  .title {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.3rem;
    color: #ff0066;
    text-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
    letter-spacing: 0.1em;
  }

  .message {
    font-size: 0.85rem;
    color: #a0a8c0;
  }

  .score-display {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .score-label {
    font-size: 0.6rem;
    color: #556;
    letter-spacing: 0.15em;
  }

  .score-value {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.3rem;
    color: #ff0066;
  }

  .retry-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.8rem;
    padding: 0.8rem 2rem;
    background: transparent;
    color: #ff0066;
    border: 2px solid #ff0066;
    border-radius: 8px;
    cursor: pointer;
    letter-spacing: 0.1em;
    transition: all 0.3s;
  }

  .retry-btn:hover {
    background: rgba(255, 0, 102, 0.1);
    box-shadow: 0 0 20px rgba(255, 0, 102, 0.3);
    transform: scale(1.05);
  }
</style>
