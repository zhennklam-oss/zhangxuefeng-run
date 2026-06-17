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
  private fallGravity = 600; // falling 重力(每个纸条随机)
  private restY = 0; // falling 落定的顶边 y(可停在半空)
  private swayAmp = 0; // falling 横向飘摆幅度
  private swayPhase = 0;
  private swaySpeed = 0;
  private rising = false; // guitar 抬升中/已抬升
  private targetY = 0; // guitar 抬升目标顶边
  private glowPhase = 0; // 救护车发光相位

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
    this.glowPhase = 0;

    if (spec.behavior === 'falling') {
      // 纸条随机化: 起始高度/初速/重力/横向飘摆/落定高度都不同
      this.y = -this.h - Math.random() * 520;
      this.vy = 20 + Math.random() * 140;
      this.fallGravity = 260 + Math.random() * 520;
      this.swayAmp = 18 + Math.random() * 46;
      this.swaySpeed = 1.5 + Math.random() * 2.5;
      this.swayPhase = Math.random() * Math.PI * 2;
      // 多数落地, 少数停在半空成为高低不一的空中障碍
      const airborne = Math.random() < 0.4;
      const gap = airborne ? FLOATING_GAP + Math.random() * 90 : 0;
      this.restY = GROUND_Y - gap - this.h;
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
        if (this.y < this.restY) {
          this.vy += this.fallGravity * dt;
          this.y += this.vy * dt;
          // 飘摆 + 缓慢翻转, 像纸片飘落
          this.swayPhase += this.swaySpeed * dt;
          this.x += Math.sin(this.swayPhase) * this.swayAmp * dt;
          this.rotation = Math.sin(this.swayPhase) * 0.25;
          if (this.y >= this.restY) {
            this.y = this.restY;
            this.rotation = 0;
          }
        }
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
    if (this.kind === 'ambulance') this.glowPhase += dt;
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
    // 救护车: 脚下发光, 暗示可拾取(陷阱)
    if (this.kind === 'ambulance') this.renderGlow(ctx);
    ItemSprites.draw(ctx, this.kind, this.x, this.y, this.w, this.h, this.rotation);
  }

  private renderGlow(ctx: CanvasRenderingContext2D): void {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h * 0.62;
    const pulse = 0.7 + 0.3 * Math.sin(this.glowPhase * 5);
    const radius = this.w * 0.75 * pulse;
    const g = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
    g.addColorStop(0, 'rgba(255,250,180,0.9)');
    g.addColorStop(0.5, 'rgba(255,225,90,0.45)');
    g.addColorStop(1, 'rgba(255,210,60,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
