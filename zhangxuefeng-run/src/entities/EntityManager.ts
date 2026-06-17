import { Entity } from './Entity';
import type { ObstaclePoolEntry, EntityKind } from '../types';
import { MIN_REAPPEAR_DISTANCE } from '../config/entities';
import { GAME_WIDTH } from '../constants';

// 管理实体的对象池、加权生成与回收。
export class EntityManager {
  private pool: Entity[] = [];
  private distanceSinceSpawn = 0;
  private nextGap = 0;
  private totalDistance = 0; // 累计滚动距离
  private lastSpawnDist = new Map<EntityKind, number>(); // 各类型上次出现时的累计距离

  reset(): void {
    for (const o of this.pool) o.active = false;
    this.distanceSinceSpawn = 0;
    this.nextGap = 500;
    this.totalDistance = 0;
    this.lastSpawnDist.clear();
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

  // 该类型距上次出现是否已超过最小复现距离(无限制的类型恒为 true)
  private canSpawn(kind: EntityKind): boolean {
    const min = MIN_REAPPEAR_DISTANCE[kind];
    if (min === undefined) return true;
    const last = this.lastSpawnDist.get(kind);
    if (last === undefined) return true;
    return this.totalDistance - last >= min;
  }

  update(
    dt: number,
    speed: number,
    playerX: number,
    entries: ObstaclePoolEntry[],
    gapScale = 1
  ): void {
    const dx = speed * dt;
    this.distanceSinceSpawn += dx;
    this.totalDistance += dx;

    if (this.distanceSinceSpawn >= this.nextGap && entries.length > 0) {
      // 最多重挑几次, 跳过尚未达到最小复现距离的稀有道具
      let entry = this.pickType(entries);
      for (let i = 0; i < 6 && !this.canSpawn(entry.type); i++) {
        entry = this.pickType(entries);
      }
      if (this.canSpawn(entry.type)) {
        const o = this.obtain();
        o.spawn(entry.type, GAME_WIDTH + 40);
        this.lastSpawnDist.set(entry.type, this.totalDistance);
        this.distanceSinceSpawn = 0;
        const speedFactor = Math.max(1, speed / 360);
        // gapScale<1 收紧间距(无尽后期越来越密集)
        this.nextGap =
          (entry.minGap + o.w + Math.random() * 220) * speedFactor * gapScale;
      }
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
