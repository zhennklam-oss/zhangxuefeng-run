import { Obstacle } from './Obstacle';
import { OBSTACLE_SPECS } from './Obstacle';
import type { ObstaclePoolEntry } from '../types';
import { GAME_WIDTH } from '../constants';

// 管理障碍物的对象池、加权生成与回收。
export class ObstacleManager {
  private pool: Obstacle[] = [];
  private distanceSinceSpawn = 0;
  private nextGap = 0;

  reset(): void {
    for (const o of this.pool) o.active = false;
    this.distanceSinceSpawn = 0;
    this.nextGap = 500;
  }

  get active(): Obstacle[] {
    return this.pool.filter((o) => o.active);
  }

  private obtain(): Obstacle {
    let o = this.pool.find((x) => !x.active);
    if (!o) {
      o = new Obstacle();
      this.pool.push(o);
    }
    return o;
  }

  // 按权重随机挑选一个障碍类型
  private pickType(entries: ObstaclePoolEntry[]): ObstaclePoolEntry {
    const total = entries.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return entries[entries.length - 1];
  }

  // dx: 本帧世界滚动的像素距离; entries: 当前可用障碍配方
  update(dt: number, speed: number, entries: ObstaclePoolEntry[]): void {
    const dx = speed * dt;
    this.distanceSinceSpawn += dx;

    if (this.distanceSinceSpawn >= this.nextGap && entries.length > 0) {
      const entry = this.pickType(entries);
      const o = this.obtain();
      o.spawn(entry.type, GAME_WIDTH + 40);
      this.distanceSinceSpawn = 0;
      // 下一个间距 = 该障碍 minGap + 随机量,随速度略放大保证可反应
      const spec = OBSTACLE_SPECS[entry.type];
      const speedFactor = Math.max(1, speed / 360);
      this.nextGap =
        (entry.minGap + spec.w + Math.random() * 220) * speedFactor;
    }

    for (const o of this.pool) {
      if (o.active) o.update(dt, speed);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const o of this.pool) {
      if (o.active) o.render(ctx);
    }
  }
}
