import type { LevelConfig } from '../types';

// ========================================================================
// 关卡配置表(数据驱动)
// ------------------------------------------------------------------------
// 当前为 6 关占位数据,仅难度曲线(速度/距离/障碍配方)递增。
// 关卡主题、名称、配色、障碍组合待用户后续确定,改这里即可,无需动逻辑。
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
      { type: 'qiaolezi', weight: 3, minGap: 320 },
      { type: 'gunmu', weight: 2, minGap: 340 },
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
      { type: 'qiaolezi', weight: 3, minGap: 300 },
      { type: 'gunmu', weight: 3, minGap: 320 },
      { type: 'xuebi', weight: 2, minGap: 340 },
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
      { type: 'xuebi', weight: 3, minGap: 300 },
      { type: 'gunmu', weight: 2, minGap: 320 },
      { type: 'shijuan', weight: 2, minGap: 300 },
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
      { type: 'qiaolezi', weight: 3, minGap: 280 },
      { type: 'shijuan', weight: 2, minGap: 300 },
      { type: 'maikefeng', weight: 2, minGap: 320 },
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
      { type: 'qiaolezi', weight: 2, minGap: 270 },
      { type: 'xuebi', weight: 2, minGap: 280 },
      { type: 'gunmu', weight: 2, minGap: 290 },
      { type: 'maikefeng', weight: 2, minGap: 300 },
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
      { type: 'qiaolezi', weight: 2, minGap: 250 },
      { type: 'xuebi', weight: 2, minGap: 260 },
      { type: 'gunmu', weight: 2, minGap: 260 },
      { type: 'shijuan', weight: 2, minGap: 250 },
      { type: 'maikefeng', weight: 2, minGap: 270 },
    ],
  },
];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export const TOTAL_LEVELS = LEVELS.length;
