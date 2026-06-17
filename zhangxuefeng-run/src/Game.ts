import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { InputManager } from './systems/InputManager';
import type { Scene } from './scenes/Scene';

// 游戏核心：持有 canvas、主循环、当前场景，并负责响应式缩放。
export class Game {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly input: InputManager;

  private scene!: Scene;
  private lastTime = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    this.input = new InputManager(canvas);

    this.resize();
    window.addEventListener('resize', this.resize);
  }

  // 切换场景
  setScene(scene: Scene): void {
    if (this.scene) this.scene.exit();
    this.scene = scene;
    this.scene.enter();
  }

  start(scene: Scene): void {
    this.setScene(scene);
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  // 让 canvas 保持 16:9, 居中显示且不占满整个视口(留白更美观)
  private resize = () => {
    // 只用视口的一部分: 宽度最多 82%, 高度最多 88%, 并设绝对像素上限
    const MAX_W = 1100;
    const vw = window.innerWidth * 0.82;
    const vh = window.innerHeight * 0.88;
    const scale = Math.min(vw / GAME_WIDTH, vh / GAME_HEIGHT, MAX_W / GAME_WIDTH);
    this.canvas.style.width = `${Math.round(GAME_WIDTH * scale)}px`;
    this.canvas.style.height = `${Math.round(GAME_HEIGHT * scale)}px`;
  };

  private loop = (now: number) => {
    if (!this.running) return;
    // dt 上限避免切后台回来后大跳
    let dt = (now - this.lastTime) / 1000;
    if (dt > 0.05) dt = 0.05;
    this.lastTime = now;

    const input = this.input.poll();
    this.scene.update(dt, input);

    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.scene.render(this.ctx);

    requestAnimationFrame(this.loop);
  };
}
