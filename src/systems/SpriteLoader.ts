import { SPRITE_CELL, SPRITE_COLS } from '../constants';

// 加载精灵图并按 3x3 网格切帧绘制。
export class SpriteLoader {
  private img: HTMLImageElement;
  loaded = false;

  constructor(url: string) {
    this.img = new Image();
    this.img.onload = () => {
      this.loaded = true;
    };
    this.img.src = url;
  }

  // 按帧索引(0-based, 行优先)绘制到目标矩形。
  drawFrame(
    ctx: CanvasRenderingContext2D,
    frame: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    flip = false
  ): void {
    if (!this.loaded) return;
    const col = frame % SPRITE_COLS;
    const row = Math.floor(frame / SPRITE_COLS);
    const sx = col * SPRITE_CELL;
    const sy = row * SPRITE_CELL;

    if (flip) {
      ctx.save();
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.img, sx, sy, SPRITE_CELL, SPRITE_CELL, 0, 0, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(this.img, sx, sy, SPRITE_CELL, SPRITE_CELL, dx, dy, dw, dh);
    }
  }
}

// 帧索引常量(对照 人物形象参考.png 九姿势)
export const FRAME = {
  RUN_1: 0, // (0,0) 奔跑1
  RUN_2: 1, // (0,1) 奔跑2
  SLIDE: 2, // (0,2) 滑铲(后仰带尘)
  IDLE: 3, // (1,0) 站立/行走
  HIT: 4, // (1,1) 受击(踉跄)
  DASH: 5, // (1,2) 冲刺(速度线/前倾加速)
  START: 6, // (2,0) 起跑(低伏撑地)
  JUMP: 7, // (2,1) 跳跃(腾空带尘)
  SKATE: 8, // (2,2) 滑板(预留)
} as const;
