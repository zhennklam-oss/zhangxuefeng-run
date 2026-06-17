import type { Player } from '../entities/Player';
import type { Entity } from '../entities/Entity';
import { aabbOverlap } from './CollisionSystem';
import { AudioManager } from './AudioManager';

export interface InteractionResult {
  obstacleHit: boolean; // 本帧撞到障碍(应扣血)
  healed: boolean; // 吃到爱心(+1 体力)
  dashStarted: boolean; // 吃到书/救护车, 已触发冲刺
}

// 处理玩家与所有实体的碰撞/拾取。
// invulnActive: 受击无敌冷却生效中(防同一撞击连续扣血)。
// 返回本帧交互结果, 由场景据此扣血/计分/结算。
export function resolveInteractions(
  player: Player,
  entities: Entity[],
  invulnActive: boolean
): InteractionResult {
  const res: InteractionResult = {
    obstacleHit: false,
    healed: false,
    dashStarted: false,
  };
  const pbox = player.getHitbox();

  for (const e of entities) {
    if (!aabbOverlap(pbox, e.getHitbox())) continue;

    if (e.spec.category === 'pickup') {
      if (e.consumed) continue;
      e.consumed = true;
      e.active = false;
      switch (e.spec.effect) {
        case 'heal':
          res.healed = true;
          AudioManager.play('pass');
          break;
        case 'dash':
          player.startDash(false);
          res.dashStarted = true;
          AudioManager.play('combo');
          break;
        case 'ambulance':
          player.startDash(true);
          res.dashStarted = true;
          AudioManager.play('combo');
          break;
      }
      continue;
    }

    // 障碍
    if (player.invincible) {
      // 冲刺无敌: 撞飞障碍, 不扣血
      if (!e.scored) {
        e.scored = true;
        e.active = false;
      }
      continue;
    }
    if (!invulnActive && !e.scored) {
      e.scored = true;
      res.obstacleHit = true;
    }
  }
  return res;
}
