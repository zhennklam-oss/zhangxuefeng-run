import { SpriteLoader, FRAME } from '../systems/SpriteLoader';
import type { Rect } from '../types';
import {
  GROUND_Y,
  GRAVITY,
  JUMP_VELOCITY,
  SLIDE_DURATION,
  MAX_JUMPS,
  PLAYER_X,
  PLAYER_DRAW_W,
  PLAYER_DRAW_H,
} from '../constants';

export type PlayerState = 'start' | 'run' | 'jump' | 'slide' | 'hit';

export class Player {
  state: PlayerState = 'run';
  x = PLAYER_X;
  y = GROUND_Y; // 脚底 y
  private vy = 0;
  private slideTimer = 0;
  private hitTimer = 0;
  private runAnimTime = 0;
  private startTimer = 0;
  private jumpsLeft = MAX_JUMPS; // 剩余可用跳跃次数(支持二段跳)
  private sprite: SpriteLoader;

  // 一次性事件标志(由场景每帧消费,用于触发粒子/音效)
  evtJumped = false;
  evtSlid = false;
  evtLanded = false;
  evtHit = false;

  constructor(sprite: SpriteLoader) {
    this.sprite = sprite;
  }

  reset(): void {
    this.state = 'start';
    this.y = GROUND_Y;
    this.vy = 0;
    this.slideTimer = 0;
    this.hitTimer = 0;
    this.startTimer = 0.5; // 起跑姿势短暂停留
    this.jumpsLeft = MAX_JUMPS;
    this.evtJumped = this.evtSlid = this.evtLanded = this.evtHit = false;
  }

  get isAirborne(): boolean {
    return this.y < GROUND_Y - 0.5;
  }

  jump(): void {
    if (this.state === 'hit') return;
    // 还有跳跃次数即可起跳(地面起跳 + 空中二段跳)
    if (this.jumpsLeft > 0) {
      this.vy = JUMP_VELOCITY;
      this.state = 'jump';
      this.slideTimer = 0;
      this.jumpsLeft--;
      this.evtJumped = true;
    }
  }

  slide(): void {
    if (this.state === 'hit') return;
    // 仅在贴地时可滑铲;点按触发后固定滑行一段时间
    if (!this.isAirborne) {
      this.slideTimer = SLIDE_DURATION;
      this.state = 'slide';
      this.evtSlid = true;
    }
  }

  hit(): void {
    this.state = 'hit';
    this.hitTimer = 0.4;
    this.evtHit = true;
  }

  update(dt: number, jumpPressed: boolean, slidePressed: boolean): void {
    // 起跑短暂过渡
    if (this.state === 'start') {
      this.startTimer -= dt;
      if (this.startTimer <= 0) this.state = 'run';
      return;
    }

    if (this.state === 'hit') {
      this.hitTimer -= dt;
      // 受击期间仍受重力影响落回地面
      this.applyGravity(dt);
      if (this.hitTimer <= 0) {
        this.state = this.isAirborne ? 'jump' : 'run';
      }
      return;
    }

    // 输入响应(均为边沿触发)
    if (jumpPressed) this.jump();
    else if (slidePressed) this.slide();

    // 滑铲计时: 到时自动起身,不依赖按住
    if (this.state === 'slide') {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.state = 'run';
      }
    }

    this.applyGravity(dt);

    // 落地后状态归位 + 重置跳跃次数
    if (!this.isAirborne) {
      if (this.state === 'jump') {
        this.state = 'run';
        this.evtLanded = true;
      }
      this.jumpsLeft = MAX_JUMPS;
    }

    if (this.state === 'run') {
      this.runAnimTime += dt;
    }
  }

  private applyGravity(dt: number): void {
    if (this.isAirborne || this.vy < 0) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
      }
    }
  }

  // 当前帧索引
  private currentFrame(): number {
    switch (this.state) {
      case 'start':
        return FRAME.START;
      case 'jump':
        return FRAME.JUMP;
      case 'slide':
        return FRAME.SLIDE;
      case 'hit':
        return FRAME.HIT;
      case 'run':
      default:
        // 双帧循环, 每 0.12s 切换
        return Math.floor(this.runAnimTime / 0.12) % 2 === 0
          ? FRAME.RUN_1
          : FRAME.RUN_2;
    }
  }

  // 碰撞盒(滑铲时更扁更低)
  getHitbox(): Rect {
    const w = PLAYER_DRAW_W * 0.5;
    if (this.state === 'slide') {
      const h = PLAYER_DRAW_H * 0.45;
      return { x: this.x - w / 2, y: this.y - h, w, h };
    }
    const h = PLAYER_DRAW_H * 0.85;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 受击闪烁
    if (this.state === 'hit' && Math.floor(this.hitTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    const dw = PLAYER_DRAW_W;
    const dh = PLAYER_DRAW_H;
    // 滑铲时整体压低一点贴地
    const dy = this.y - dh + (this.state === 'slide' ? dh * 0.1 : 0);
    this.sprite.drawFrame(ctx, this.currentFrame(), this.x - dw / 2, dy, dw, dh);
    ctx.globalAlpha = 1;
  }
}
