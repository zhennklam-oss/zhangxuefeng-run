// 全局类型定义

export type ObstacleType =
  | 'qiaolezi' // 巧乐兹雪糕 — 跳跃越过
  | 'xuebi' // 雪碧塑料瓶 — 滑铲通过(高位)
  | 'gunmu' // 滚木 — 跳跃越过
  | 'shijuan' // 试卷堆 — 跳跃越过
  | 'maikefeng'; // 麦克风架 — 滑铲通过(高位)

// 躲避动作：跳过 or 铲过
export type AvoidAction = 'jump' | 'slide';

export interface ObstaclePoolEntry {
  type: ObstacleType;
  weight: number; // 出现权重
  minGap: number; // 与下一个障碍的最小间距(px)
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  distance: number; // 通关距离(米)
  baseSpeed: number; // 初始滚动速度(px/s)
  maxSpeed: number; // 关卡内最高速度(px/s)
  backgroundColor: string;
  groundColor: string;
  cloudColor: string;
  lives: number;
  obstaclePool: ObstaclePoolEntry[];
}

// 矩形碰撞盒
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// 游戏模式
export type GameMode = 'level' | 'endless';

// 输入意图(由 InputManager 归一化键盘/触屏后产出)
export interface InputState {
  jump: boolean; // 本帧是否触发跳跃(边沿)
  slide: boolean; // 本帧是否触发滑铲(边沿)
  confirm: boolean; // 确认/开始(菜单用)
}
