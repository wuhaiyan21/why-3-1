<script lang="ts">
  import { gameStore } from './stores/gameStore';
  import { GamePhase } from './lib/types';
  import StartScreen from './components/StartScreen.svelte';
  import HUD from './components/HUD.svelte';
  import LevelComplete from './components/LevelComplete.svelte';
  import GameOver from './components/GameOver.svelte';
  import AllComplete from './components/AllComplete.svelte';
  import GameCanvas from './components/GameCanvas.svelte';
  import Sidebar from './components/Sidebar.svelte';

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'p' || e.key === 'P') {
      if ($gameStore.phase === GamePhase.PLAYING) {
        gameStore.pause();
        return;
      }
      if ($gameStore.phase === GamePhase.PAUSED) {
        gameStore.resume();
        return;
      }
    }

    if ($gameStore.phase === GamePhase.PAUSED) return;

    const dirMap: Record<string, import('./lib/types').Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };
    const dir = dirMap[e.key];
    if (dir) {
      e.preventDefault();
      gameStore.move(dir);
    }
  }

  $: phase = $gameStore.phase;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app">
  {#if phase === GamePhase.START}
    <StartScreen />
  {:else}
    <HUD />
    <GameCanvas />
    <Sidebar />
    {#if phase === GamePhase.PAUSED}
      <div class="pause-overlay">
        <div class="pause-card">
          <div class="pause-icon">⏸</div>
          <h2 class="pause-title">PAUSED</h2>
          <p class="pause-hint">按 P 键或点击按钮继续</p>
          <button class="resume-btn" onclick={() => gameStore.resume()}>
            RESUME
          </button>
        </div>
      </div>
    {:else if phase === GamePhase.LEVEL_COMPLETE}
      <LevelComplete />
    {:else if phase === GamePhase.GAME_OVER}
      <GameOver />
    {:else if phase === GamePhase.ALL_COMPLETE}
      <AllComplete />
    {/if}
  {/if}
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    background: #0a0e1a;
    color: #e0e0e0;
    font-family: 'Orbitron', sans-serif;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  :global(#app) {
    height: 100vh;
    width: 100vw;
  }

  .app {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .pause-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
    animation: fadeIn 0.2s ease;
    pointer-events: none;
  }

  .pause-overlay .pause-card {
    pointer-events: auto;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .pause-card {
    background: rgba(10, 14, 26, 0.95);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 16px;
    padding: 2.5rem 3rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    box-shadow: 0 0 40px rgba(0, 240, 255, 0.1);
    animation: scaleIn 0.2s ease;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .pause-icon {
    font-size: 3rem;
  }

  .pause-title {
    font-family: 'Press Start 2P', cursive;
    font-size: 1.8rem;
    color: #00f0ff;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
    letter-spacing: 0.15em;
  }

  .pause-hint {
    font-size: 0.75rem;
    color: #a0a8c0;
  }

  .resume-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 0.85rem;
    padding: 0.8rem 2rem;
    background: transparent;
    border: 2px solid #00f0ff;
    border-radius: 8px;
    color: #00f0ff;
    cursor: pointer;
    letter-spacing: 0.1em;
    transition: all 0.3s;
  }

  .resume-btn:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1);
    transform: scale(1.05);
  }

  .resume-btn:active {
    transform: scale(0.98);
  }
</style>
