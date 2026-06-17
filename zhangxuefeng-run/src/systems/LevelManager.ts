import type { LevelConfig } from '../types';

// 跟踪单关进度: 速度随距离从 baseSpeed 线性提升到 maxSpeed,距离达标即通关。
export class LevelManager {
  readonly config: LevelConfig;
  private distancePx = 0;
  private targetPx: number;

  constructor(config: LevelConfig) {
    this.config = config;
    this.targetPx = config.distance * 10; // PIXELS_PER_METER
  }

  get currentSpeed(): number {
    const progress = Math.min(1, this.distancePx / this.targetPx);
    return (
      this.config.baseSpeed +
      (this.config.maxSpeed - this.config.baseSpeed) * progress
    );
  }

  get meters(): number {
    return Math.floor(this.distancePx / 10);
  }

  get progress(): number {
    return Math.min(1, this.distancePx / this.targetPx);
  }

  get isComplete(): boolean {
    return this.distancePx >= this.targetPx;
  }

  advance(dt: number): void {
    this.distancePx += this.currentSpeed * dt;
  }
}
