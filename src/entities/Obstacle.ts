import type { ObstacleType, AvoidAction, Rect } from '../types';
import { GROUND_Y } from '../constants';

interface ObstacleSpec {
  w: number;
  h: number;
  avoid: AvoidAction; // 正确躲避方式
  floating: boolean; // true=高位障碍(需滑铲), false=地面障碍(需跳跃)
  color: string; // 占位主色
  accent: string; // 占位辅色
  label: string;
}

// 各障碍物规格(占位外观)。素材到位后替换为贴图。
export const OBSTACLE_SPECS: Record<ObstacleType, ObstacleSpec> = {
  qiaolezi: {
    w: 60,
    h: 90,
    avoid: 'jump',
    floating: false,
    color: '#6b4226',
    accent: '#8e44ad',
    label: '巧乐兹',
  },
  gunmu: {
    w: 110,
    h: 56,
    avoid: 'jump',
    floating: false,
    color: '#8b5a2b',
    accent: '#5d3a1a',
    label: '滚木',
  },
  shijuan: {
    w: 80,
    h: 70,
    avoid: 'jump',
    floating: false,
    color: '#f5f5f5',
    accent: '#cccccc',
    label: '试卷',
  },
  xuebi: {
    w: 70,
    h: 80,
    avoid: 'slide',
    floating: true,
    color: '#27ae60',
    accent: '#1e8449',
    label: '雪碧',
  },
  maikefeng: {
    w: 46,
    h: 130,
    avoid: 'slide',
    floating: true,
    color: '#2c3e50',
    accent: '#1a242f',
    label: '麦克风',
  },
};

// 高位障碍悬空高度(底边离地面的距离),迫使玩家滑铲通过
const FLOATING_GAP = 70;

export class Obstacle {
  type!: ObstacleType;
  x = 0;
  y = 0; // 顶边 y
  w = 0;
  h = 0;
  avoid!: AvoidAction;
  active = false;
  scored = false; // 是否已计入"成功躲避"

  // 从对象池取出时初始化
  spawn(type: ObstacleType, x: number): void {
    const s = OBSTACLE_SPECS[type];
    this.type = type;
    this.w = s.w;
    this.h = s.h;
    this.avoid = s.avoid;
    this.x = x;
    this.y = s.floating ? GROUND_Y - FLOATING_GAP - s.h : GROUND_Y - s.h;
    this.active = true;
    this.scored = false;
  }

  update(dt: number, speed: number): void {
    this.x -= speed * dt;
    if (this.x + this.w < 0) this.active = false;
  }

  getHitbox(): Rect {
    // 略收紧碰撞盒,手感更宽容
    const pad = 0.12;
    return {
      x: this.x + this.w * pad,
      y: this.y + this.h * pad,
      w: this.w * (1 - pad * 2),
      h: this.h * (1 - pad * 2),
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const s = OBSTACLE_SPECS[this.type];
    ctx.fillStyle = s.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = s.accent;
    ctx.fillRect(this.x, this.y, this.w, this.h * 0.3);
    // 占位文字标签
    ctx.fillStyle = '#000';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, this.x + this.w / 2, this.y - 6);
  }
}
