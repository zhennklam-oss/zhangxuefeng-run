import type { EntityKind } from '../types';

// 按死因显示的失败文字。救护车=致命冲刺结束; 其余=撞击障碍。
export const DEATH_MESSAGES: Partial<Record<EntityKind, string>> = {
  ambulance: '一切都结束了',
  icecream: '你被巧乐兹三口吃掉了',
  sprite: '你与雪碧融为一体了',
  paper: '新闻学：你死掉了',
  guitar: '艺术是最没有门槛的',
  log: '欢迎报考土木',
};

// 关卡通关文字
export const LEVEL_CLEAR_MESSAGE = '你跑不过我你信吗';

// 兜底失败文字
export const DEFAULT_DEATH_MESSAGE = '你失败了';

export function deathMessage(kind: EntityKind | null): string {
  if (kind && DEATH_MESSAGES[kind]) return DEATH_MESSAGES[kind]!;
  return DEFAULT_DEATH_MESSAGE;
}
