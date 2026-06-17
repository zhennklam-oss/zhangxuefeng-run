import { Entity } from './Entity';
import type { ObstaclePoolEntry } from '../types';
import { GAME_WIDTH } from '../constants';

// 管理实体的对象池、加权生成与回收。
export class EntityManager {
  private pool: Entity[] = [];
  private distanceSinceSpawn = 0;
  private nextGap = 0;

  reset(): void {
    for (const o of this.pool) o.active = false;
    this.distanceSinceSpawn = 0;
    this.nextGap = 500;
  }

  get active(): Entity[] {
    return this.pool.filter((o) => o.active);
  }

  private obtain(): Entity {
    let o = this.pool.find((x) => !x.active);
    if (!o) {
      o = new Entity();
      this.pool.push(o);
    }
    return o;
  }

  private pickType(entries: ObstaclePoolEntry[]): ObstaclePoolEntry {
    const total = entries.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return entries[entries.length - 1];
  }

  update(
    dt: number,
    speed: number,
    playerX: number,
    entries: ObstaclePoolEntry[]
  ): void {
    this.distanceSinceSpawn += speed * dt;

    if (this.distanceSinceSpawn >= this.nextGap && entries.length > 0) {
      const entry = this.pickType(entries);
      const o = this.obtain();
      o.spawn(entry.type, GAME_WIDTH + 40);
      this.distanceSinceSpawn = 0;
      const speedFactor = Math.max(1, speed / 360);
      this.nextGap = (entry.minGap + o.w + Math.random() * 220) * speedFactor;
    }

    for (const o of this.pool) {
      if (o.active) o.update(dt, speed, playerX);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const o of this.pool) {
      if (o.active) o.render(ctx);
    }
  }
}
