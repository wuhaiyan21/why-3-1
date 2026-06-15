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
    {#if phase === GamePhase.LEVEL_COMPLETE}
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
</style>
