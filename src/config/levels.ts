import type { LevelConfig } from '../types';

// ========================================================================
// 关卡配置表(数据驱动)
// ------------------------------------------------------------------------
// 6 关难度递增, 并逐步引入新机制:
// L1 雪糕/滚木(跳) → L2 +雪碧(滑铲) → L3 +坠落纸张/爱心
// L4 +吉他抬升/考研书冲刺 → L5 +救护车陷阱 → L6 全要素
// 主题名/配色待定, 改这里即可, 无需动逻辑。
// ========================================================================

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '第一关',
    subtitle: '待定主题',
    distance: 600,
    baseSpeed: 380,
    maxSpeed: 460,
    backgroundColor: '#cfe8f5',
    groundColor: '#e9d8a6',
    cloudColor: '#ffffff',
    lives: 3,
    obstaclePool: [
      { type: 'icecream', weight: 3, minGap: 320 },
      { type: 'log', weight: 2, minGap: 360 },
    ],
  },
  {
    id: 2,
    name: '第二关',
    subtitle: '待定主题',
    distance: 800,
    baseSpeed: 440,
    maxSpeed: 540,
    backgroundColor: '#d6ecd2',
    groundColor: '#cdb892',
    cloudColor: '#ffffff',
    lives: 3,
    obstaclePool: [
      { type: 'icecream', weight: 3, minGap: 300 },
      { type: 'log', weight: 3, minGap: 340 },
      { type: 'sprite', weight: 2, minGap: 320 },
    ],
  },
  {
    id: 3,
    name: '第三关',
    subtitle: '待定主题',
    distance: 1000,
    baseSpeed: 500,
    maxSpeed: 620,
    backgroundColor: '#e0e0e6',
    groundColor: '#bdbdbd',
    cloudColor: '#f4f4f8',
    lives: 3,
    obstaclePool: [
      { type: 'sprite', weight: 3, minGap: 300 },
      { type: 'log', weight: 2, minGap: 320 },
      { type: 'paper', weight: 2, minGap: 320 },
      { type: 'heart', weight: 1, minGap: 360 },
    ],
  },
  {
    id: 4,
    name: '第四关',
    subtitle: '待定主题',
    distance: 1200,
    baseSpeed: 560,
    maxSpeed: 700,
    backgroundColor: '#f5e6c8',
    groundColor: '#c9a86a',
    cloudColor: '#fff6e0',
    lives: 3,
    obstaclePool: [
      { type: 'icecream', weight: 3, minGap: 280 },
      { type: 'paper', weight: 2, minGap: 300 },
      { type: 'guitar', weight: 2, minGap: 340 },
      { type: 'book', weight: 1, minGap: 360 },
    ],
  },
  {
    id: 5,
    name: '第五关',
    subtitle: '待定主题',
    distance: 1400,
    baseSpeed: 620,
    maxSpeed: 780,
    backgroundColor: '#c5cbe0',
    groundColor: '#8f93a8',
    cloudColor: '#dfe3f0',
    lives: 3,
    obstaclePool: [
      { type: 'icecream', weight: 2, minGap: 270 },
      { type: 'sprite', weight: 2, minGap: 280 },
      { type: 'log', weight: 2, minGap: 300 },
      { type: 'guitar', weight: 2, minGap: 320 },
      { type: 'heart', weight: 1, minGap: 360 },
      { type: 'ambulance', weight: 1, minGap: 360 },
    ],
  },
  {
    id: 6,
    name: '第六关',
    subtitle: '待定主题',
    distance: 1600,
    baseSpeed: 700,
    maxSpeed: 880,
    backgroundColor: '#f3e1b0',
    groundColor: '#d4af37',
    cloudColor: '#fff8dc',
    lives: 3,
    obstaclePool: [
      { type: 'icecream', weight: 2, minGap: 250 },
      { type: 'sprite', weight: 2, minGap: 260 },
      { type: 'log', weight: 2, minGap: 280 },
      { type: 'paper', weight: 2, minGap: 260 },
      { type: 'guitar', weight: 2, minGap: 300 },
      { type: 'heart', weight: 1, minGap: 340 },
      { type: 'book', weight: 1, minGap: 340 },
      { type: 'ambulance', weight: 1, minGap: 340 },
    ],
  },
];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export const TOTAL_LEVELS = LEVELS.length;
