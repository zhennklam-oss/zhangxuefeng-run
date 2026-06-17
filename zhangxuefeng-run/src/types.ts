// 全局类型定义

// 所有可生成实体(障碍 + 道具)
export type EntityKind =
  | 'icecream' // 巧克力雪糕 — 地面障碍, 跳跃越过
  | 'sprite' // 雪碧塑料瓶 — 空中障碍, 滑铲通过
  | 'log' // 滚木 — 地面障碍, 向人物滚来, 跳跃越过
  | 'paper' // "新闻已死"纸 — 从空中坠落的障碍
  | 'guitar' // 吉他 — 地面障碍, 人物靠近时抬升为空中障碍(改滑铲)
  | 'heart' // 爱心 — 道具, +1 体力
  | 'ambulance' // 救护车 — 陷阱道具, 无敌冲刺后扣光体力
  | 'book'; // "考研指导"书 — 道具, 安全冲刺一段

// 实体类别
export type EntityCategory = 'obstacle' | 'pickup';

// 运动行为
export type EntityBehavior =
  | 'static' // 随场景匀速左移
  | 'rolling' // 比场景更快地朝人物滚来(并旋转)
  | 'falling' // 从空中坠落
  | 'rising'; // 地面障碍, 人物靠近时抬升

// 道具效果
export type PickupEffect = 'heal' | 'dash' | 'ambulance';

// 躲避动作：跳过 or 铲过
export type AvoidAction = 'jump' | 'slide';

export interface ObstaclePoolEntry {
  type: EntityKind;
  weight: number; // 出现权重
  minGap: number; // 与下一个实体的最小间距(px)
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
