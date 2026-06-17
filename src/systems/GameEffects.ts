import { ParticleSystem } from './ParticleSystem';
import { Background } from '../entities/Background';
import type { Player } from '../entities/Player';
import { GROUND_Y } from '../constants';

// 聚合视觉反馈: 视差背景 + 粒子 + 屏幕震动。供关卡/无尽场景共用。
export class GameEffects {
  readonly background: Background;
  readonly particles = new ParticleSystem();
  private shake = 0;

  constructor(sky: string, ground: string, cloud: string) {
    this.background = new Background(sky, ground, cloud);
  }

  // 读取并消费玩家一次性事件,触发对应粒子/震动。
  // 返回触发的事件名,供场景层接音效。
  consumePlayerEvents(player: Player): {
    jumped: boolean;
    slid: boolean;
    landed: boolean;
    hit: boolean;
  } {
    const ev = {
      jumped: player.evtJumped,
      slid: player.evtSlid,
      landed: player.evtLanded,
      hit: player.evtHit,
    };
    const feetY = GROUND_Y;
    if (ev.jumped) {
      this.particles.burst(player.x, feetY, 8, '#cbb98a', { speed: 200 });
    }
    if (ev.slid) {
      this.particles.burst(player.x + 20, feetY, 10, '#d8c8a0', {
        speed: 280,
        spread: Math.PI / 2,
      });
    }
    if (ev.landed) {
      this.particles.burst(player.x, feetY, 12, '#cbb98a', { speed: 260 });
    }
    if (ev.hit) {
      this.particles.burst(player.x, feetY - 60, 18, '#e74c3c', {
        speed: 360,
        spread: Math.PI * 2,
      });
      this.shake = 14;
    }
    player.evtJumped = player.evtSlid = player.evtLanded = player.evtHit = false;
    return ev;
  }

  update(dt: number, speed: number): void {
    this.background.update(dt, speed);
    this.particles.update(dt);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - 60 * dt);
    }
  }

  // 当前震动偏移
  shakeOffset(): { x: number; y: number } {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shake,
      y: (Math.random() - 0.5) * this.shake,
    };
  }

  reset(): void {
    this.particles.clear();
    this.shake = 0;
  }
}
