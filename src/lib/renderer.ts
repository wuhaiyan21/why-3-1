import type { GameState, Enemy, KeyItem, PowerUp, ActiveBuff, Position } from './types';
import { CellType, PowerUpType } from './types';

const COLORS = {
  background: '#0a0e1a',
  wall: '#141832',
  wallEdge: '#1a2444',
  path: '#0d1225',
  player: '#00f0ff',
  playerGlow: 'rgba(0,240,255,0.3)',
  enemy: '#ff0066',
  enemyGlow: 'rgba(255,0,102,0.3)',
  key: '#ffd700',
  keyGlow: 'rgba(255,215,0,0.3)',
  exitOpen: '#00ff88',
  exitClosed: '#333344',
  speedUp: '#4488ff',
  invincible: '#ffaa00',
  invincibleGlow: 'rgba(255,170,0,0.3)',
  speedGlow: 'rgba(68,136,255,0.3)',
};

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
  animTime: number
): void {
  const maze = state.maze;
  const rows = maze.length;
  const cols = maze[0].length;

  const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows);
  const offsetX = (canvasWidth - cols * cellSize) / 2;
  const offsetY = (canvasHeight - rows * cellSize) / 2;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * cellSize;
      const y = offsetY + r * cellSize;

      if (maze[r][c] === CellType.WALL) {
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = COLORS.wallEdge;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      } else {
        ctx.fillStyle = COLORS.path;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  renderExit(ctx, state.exitPosition, state.exitOpen, cellSize, offsetX, offsetY, animTime);
  renderKeys(ctx, state.keys, cellSize, offsetX, offsetY, animTime);
  renderPowerUps(ctx, state.powerUps, cellSize, offsetX, offsetY, animTime);
  renderEnemies(ctx, state.enemies, cellSize, offsetX, offsetY, animTime);
  renderPlayer(ctx, state.player.position, state.invincibleBuff, state.speedBuff, cellSize, offsetX, offsetY, animTime);
}

function renderExit(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  open: boolean,
  cellSize: number,
  ox: number,
  oy: number,
  time: number
): void {
  const x = ox + pos.col * cellSize;
  const y = oy + pos.row * cellSize;
  const pad = cellSize * 0.15;

  if (open) {
    const pulse = 0.6 + 0.4 * Math.sin(time * 3);
    ctx.shadowColor = COLORS.exitOpen;
    ctx.shadowBlur = cellSize * pulse;
    ctx.fillStyle = COLORS.exitOpen;
    ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = COLORS.exitOpen;
    ctx.lineWidth = 1.5;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const arrowSize = cellSize * 0.2;
    ctx.beginPath();
    ctx.moveTo(cx - arrowSize, cy - arrowSize);
    ctx.lineTo(cx + arrowSize, cy);
    ctx.lineTo(cx - arrowSize, cy + arrowSize);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = COLORS.exitClosed;
    ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const lockSize = cellSize * 0.15;
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - lockSize * 0.5, lockSize, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#777';
    ctx.fillRect(cx - lockSize, cy, lockSize * 2, lockSize * 1.5);
  }
}

function renderKeys(
  ctx: CanvasRenderingContext2D,
  keys: KeyItem[],
  cellSize: number,
  ox: number,
  oy: number,
  time: number
): void {
  for (const key of keys) {
    if (key.collected) continue;
    const x = ox + key.position.col * cellSize + cellSize / 2;
    const y = oy + key.position.row * cellSize + cellSize / 2;
    const bob = Math.sin(time * 2 + key.position.row) * cellSize * 0.05;
    const r = cellSize * 0.25;

    ctx.shadowColor = COLORS.key;
    ctx.shadowBlur = cellSize * 0.3;
    ctx.fillStyle = COLORS.key;
    ctx.beginPath();
    ctx.arc(x, y + bob - r * 0.3, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - r * 0.12, y + bob - r * 0.1, r * 0.24, r * 0.8);
    ctx.fillRect(x - r * 0.12, y + bob + r * 0.3, r * 0.4, r * 0.12);
    ctx.fillRect(x - r * 0.12, y + bob + r * 0.55, r * 0.3, r * 0.12);
    ctx.shadowBlur = 0;
  }
}

function renderPowerUps(
  ctx: CanvasRenderingContext2D,
  powerUps: PowerUp[],
  cellSize: number,
  ox: number,
  oy: number,
  time: number
): void {
  for (const pu of powerUps) {
    if (pu.collected) continue;
    const x = ox + pu.position.col * cellSize + cellSize / 2;
    const y = oy + pu.position.row * cellSize + cellSize / 2;
    const pulse = 0.7 + 0.3 * Math.sin(time * 4 + pu.position.col);
    const r = cellSize * 0.3;

    if (pu.type === PowerUpType.SPEED) {
      ctx.shadowColor = COLORS.speedUp;
      ctx.shadowBlur = cellSize * 0.3 * pulse;
      ctx.fillStyle = COLORS.speedUp;
      drawLightning(ctx, x, y, r);
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = COLORS.invincible;
      ctx.shadowBlur = cellSize * 0.3 * pulse;
      ctx.fillStyle = COLORS.invincible;
      drawShield(ctx, x, y, r);
      ctx.shadowBlur = 0;
    }
  }
}

function drawLightning(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy - r);
  ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
  ctx.lineTo(cx - r * 0.05, cy + r * 0.1);
  ctx.lineTo(cx + r * 0.2, cy + r);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
  ctx.lineTo(cx + r * 0.05, cy - r * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawShield(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + r, cy - r * 0.5, cx + r, cy);
  ctx.quadraticCurveTo(cx + r * 0.5, cy + r * 0.8, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.5, cy + r * 0.8, cx - r, cy);
  ctx.quadraticCurveTo(cx - r, cy - r * 0.5, cx, cy - r);
  ctx.closePath();
  ctx.fill();
}

function renderEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  cellSize: number,
  ox: number,
  oy: number,
  time: number
): void {
  for (const enemy of enemies) {
    const x = ox + enemy.position.col * cellSize + cellSize / 2;
    const y = oy + enemy.position.row * cellSize + cellSize / 2;
    const flicker = 0.7 + 0.3 * Math.sin(time * 5 + enemy.position.row * 3);
    const r = cellSize * 0.35;

    ctx.shadowColor = COLORS.enemy;
    ctx.shadowBlur = cellSize * 0.4 * flicker;

    ctx.fillStyle = COLORS.enemy;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.2, r, Math.PI, 0);
    ctx.lineTo(x + r, y + r * 0.6);
    const waveParts = 3;
    for (let i = 0; i < waveParts; i++) {
      const sx = x + r - (2 * r * (i + 0.5)) / waveParts;
      const sy = y + r * 0.6 + ((i % 2 === 0) ? r * 0.3 : 0);
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(x - r, y + r * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.arc(x + r * 0.25, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  invincibleBuff: ActiveBuff | null,
  speedBuff: ActiveBuff | null,
  cellSize: number,
  ox: number,
  oy: number,
  time: number
): void {
  const x = ox + pos.col * cellSize + cellSize / 2;
  const y = oy + pos.row * cellSize + cellSize / 2;
  const r = cellSize * 0.3;

  if (invincibleBuff) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.shadowColor = COLORS.invincible;
    ctx.shadowBlur = cellSize * 0.5 * pulse;
    ctx.strokeStyle = COLORS.invincible;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (speedBuff) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 8);
    ctx.shadowColor = COLORS.speedUp;
    ctx.shadowBlur = cellSize * 0.4 * pulse;
  } else {
    ctx.shadowColor = COLORS.player;
    ctx.shadowBlur = cellSize * 0.3;
  }

  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0e1a';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.arc(x + r * 0.25, y - r * 0.15, r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.06, 0, Math.PI * 2);
  ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}
