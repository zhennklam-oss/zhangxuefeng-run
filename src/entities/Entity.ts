import type { EntityKind, Rect } from '../types';
import {
  ENTITY_SPECS,
  FLOATING_GAP,
  PICKUP_GAP,
  LOG_SPEED_FACTOR,
  GUITAR_RISE_TRIGGER,
  type EntitySpec,
} from '../config/entities';
import { GROUND_Y } from '../constants';
import { ItemSprites } from '../systems/ItemSprites';

// 统一游戏实体: 障碍 + 道具。行为由 spec.behavior 驱动。
export class Entity {
  kind!: EntityKind;
  spec!: EntitySpec;
  x = 0;
  y = 0; // 顶边 y
  w = 0;
  h = 0;
  active = false;
  scored = false; // 障碍: 是否已结算(撞击/越过); 道具: 是否已拾取
  consumed = false; // 道具被吃掉

  private rotation = 0;
  private vy = 0; // falling 用
  private rising = false; // guitar 抬升中/已抬升
  private targetY = 0; // guitar 抬升目标顶边

  spawn(kind: EntityKind, x: number): void {
    const spec = ENTITY_SPECS[kind];
    this.kind = kind;
    this.spec = spec;
    this.h = spec.drawH;
    this.w = ItemSprites.widthForHeight(kind, spec.drawH);
    this.x = x;
    this.active = true;
    this.scored = false;
    this.consumed = false;
    this.rotation = 0;
    this.vy = 0;
    this.rising = false;

    if (spec.behavior === 'falling') {
      this.y = -this.h - Math.random() * 160; // 从屏幕上方坠落
      this.vy = 80;
    } else if (spec.floating) {
      // 道具用 PICKUP_GAP(跳跃可及), 高位障碍用 FLOATING_GAP(滑铲通过)
      const gap = spec.category === 'pickup' ? PICKUP_GAP : FLOATING_GAP;
      this.y = GROUND_Y - gap - this.h;
    } else {
      this.y = GROUND_Y - this.h; // 地面
    }
    this.targetY = GROUND_Y - FLOATING_GAP - this.h;
  }

  update(dt: number, speed: number, playerX: number): void {
    switch (this.spec.behavior) {
      case 'rolling':
        this.x -= speed * LOG_SPEED_FACTOR * dt;
        this.rotation += (speed * LOG_SPEED_FACTOR * dt) / (this.w / 2);
        break;
      case 'falling':
        this.x -= speed * dt;
        this.vy += 600 * dt;
        this.y += this.vy * dt;
        if (this.y > GROUND_Y - this.h) this.y = GROUND_Y - this.h;
        break;
      case 'rising':
        this.x -= speed * dt;
        // 人物靠近且尚未抬升 => 触发上升
        if (!this.rising && this.x - playerX < GUITAR_RISE_TRIGGER) {
          this.rising = true;
        }
        if (this.rising && this.y > this.targetY) {
          this.y = Math.max(this.targetY, this.y - 520 * dt);
        }
        break;
      default:
        this.x -= speed * dt;
    }
    if (this.x + this.w < -40) this.active = false;
  }

  getHitbox(): Rect {
    const pad = this.spec.hitPad;
    return {
      x: this.x + this.w * pad,
      y: this.y + this.h * pad,
      w: this.w * (1 - pad * 2),
      h: this.h * (1 - pad * 2),
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ItemSprites.draw(ctx, this.kind, this.x, this.y, this.w, this.h, this.rotation);
  }
}
