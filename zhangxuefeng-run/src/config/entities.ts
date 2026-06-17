import type {
  EntityKind,
  EntityCategory,
  EntityBehavior,
  PickupEffect,
} from '../types';

export interface EntitySpec {
  category: EntityCategory;
  behavior: EntityBehavior;
  drawH: number; // 目标绘制高度(px), 宽度按贴图比例等比
  // 障碍: 是否高位(需滑铲); 道具: 悬空在跳跃可及高度
  floating: boolean;
  hitPad: number; // 碰撞盒内缩比例(0~0.4), 越大越宽容
  effect?: PickupEffect; // 仅道具
}

// 高位障碍/抬升后吉他的底边离地高度(迫使滑铲)
export const FLOATING_GAP = 72;
// 道具悬空高度(底边离地), 需跳跃拾取, 站立够不到
export const PICKUP_GAP = 150;
// 滚木滚动速度相对场景速度的倍率
export const LOG_SPEED_FACTOR = 1.5;
// 吉他触发抬升的水平距离(px)
export const GUITAR_RISE_TRIGGER = 380;

export const ENTITY_SPECS: Record<EntityKind, EntitySpec> = {
  icecream: { category: 'obstacle', behavior: 'static', drawH: 110, floating: false, hitPad: 0.18 },
  sprite: { category: 'obstacle', behavior: 'static', drawH: 100, floating: true, hitPad: 0.16 },
  log: { category: 'obstacle', behavior: 'rolling', drawH: 88, floating: false, hitPad: 0.2 },
  paper: { category: 'obstacle', behavior: 'falling', drawH: 92, floating: false, hitPad: 0.18 },
  guitar: { category: 'obstacle', behavior: 'rising', drawH: 120, floating: false, hitPad: 0.16 },
  heart: { category: 'pickup', behavior: 'static', drawH: 78, floating: true, hitPad: 0.1, effect: 'heal' },
  ambulance: { category: 'pickup', behavior: 'static', drawH: 96, floating: true, hitPad: 0.1, effect: 'ambulance' },
  book: { category: 'pickup', behavior: 'static', drawH: 84, floating: true, hitPad: 0.1, effect: 'dash' },
};
