<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '../stores/gameStore';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    resizeCanvas();
    gameStore.setCanvas(canvas);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  });

  function resizeCanvas() {
    const headerHeight = 56;
    const padding = 20;
    canvas.width = window.innerWidth - padding * 2;
    canvas.height = window.innerHeight - headerHeight - padding * 2;
  }

  function handleTouch(e: TouchEvent, dir: string) {
    e.preventDefault();
    gameStore.move(dir as import('../lib/types').Direction);
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }

  function onTouchEnd(e: TouchEvent) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 20) return;

    if (absDx > absDy) {
      gameStore.move(dx > 0 ? 'right' : 'left');
    } else {
      gameStore.move(dy > 0 ? 'down' : 'up');
    }
  }
</script>

<canvas
  bind:this={canvas}
  class="game-canvas"
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
></canvas>

<div class="touch-controls">
  <button class="touch-btn up" on:touchstart|preventDefault={() => gameStore.move('up')} on:mousedown|preventDefault={() => gameStore.move('up')}>▲</button>
  <div class="touch-row">
    <button class="touch-btn left" on:touchstart|preventDefault={() => gameStore.move('left')} on:mousedown|preventDefault={() => gameStore.move('left')}>◄</button>
    <button class="touch-btn right" on:touchstart|preventDefault={() => gameStore.move('right')} on:mousedown|preventDefault={() => gameStore.move('right')}>►</button>
  </div>
  <button class="touch-btn down" on:touchstart|preventDefault={() => gameStore.move('down')} on:mousedown|preventDefault={() => gameStore.move('down')}>▼</button>
</div>

<style>
  .game-canvas {
    flex: 1;
    display: block;
  }

  .touch-controls {
    display: none;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 20;
  }

  .touch-row {
    display: flex;
    gap: 4px;
  }

  .touch-btn {
    width: 52px;
    height: 52px;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 10px;
    color: #00f0ff;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .touch-btn:active {
    background: rgba(0, 240, 255, 0.25);
  }

  @media (max-width: 768px) {
    .touch-controls {
      display: flex;
    }
  }
</style>
