// 全局常量

// 逻辑分辨率(16:9)。Canvas 内部按此尺寸绘制，再缩放到视口。
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// 地面线(从顶部算起的 y 坐标)。角色站立、障碍物落地的基准。
export const GROUND_Y = 600;

// 重力与跳跃(px/s^2, px/s)
export const GRAVITY = 2600;
export const JUMP_VELOCITY = -1050;

// 滑铲持续时间(秒)
export const SLIDE_DURATION = 0.6;

// 角色在屏幕中的固定横向位置(自动奔跑,世界向左滚)
export const PLAYER_X = 240;

// 1 米对应的像素数(用于距离换算)
export const PIXELS_PER_METER = 10;

// 精灵图: 3x3 网格, 每格尺寸
export const SPRITE_COLS = 3;
export const SPRITE_ROWS = 3;
export const SPRITE_CELL = 418;

// 角色在画面中的绘制尺寸
export const PLAYER_DRAW_W = 130;
export const PLAYER_DRAW_H = 130;

// 解析运行时资源路径,适配 GitHub Pages 子路径部署(base)。
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL; // 例如 '/' 或 '/repo/'
  return `${base}${path.replace(/^\//, '')}`;
}

export const CHARACTER_SPRITE_URL = assetUrl('assets/sprites/character.png');

// 无尽模式: 每隔多少秒提速
export const ENDLESS_SPEEDUP_INTERVAL = 30;
export const ENDLESS_SPEEDUP_AMOUNT = 25; // 每次提速增量(px/s)
export const ENDLESS_BASE_SPEED = 360;
export const ENDLESS_MAX_SPEED = 1100;

// 计分
export const COMBO_STEP = 0.1; // 每连击增加的倍率
export const COMBO_MAX = 3.0; // 连击倍率上限
export const AVOID_BONUS = 10; // 每次成功躲避奖励分

// localStorage 键
export const STORAGE_HIGHSCORE = 'zxf_run_highscore';
export const STORAGE_PROGRESS = 'zxf_run_progress'; // 已通关的最高关卡 id
