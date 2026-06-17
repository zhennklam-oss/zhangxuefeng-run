import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState, ObstaclePoolEntry, EntityKind } from '../types';
import { Player } from '../entities/Player';
import { EntityManager } from '../entities/EntityManager';
import { SpriteLoader } from '../systems/SpriteLoader';
import { ScoreManager } from '../systems/ScoreManager';
import { GameEffects } from '../systems/GameEffects';
import { AudioManager } from '../systems/AudioManager';
import { resolveInteractions } from '../systems/Interactions';
import { setHighScore, getHighScore } from '../systems/Storage';
import { ResultScene } from './ResultScene';
import { MenuScene } from './MenuScene';
import { deathMessage } from '../config/messages';
import { drawControlHint, drawLives } from './ui';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  CHARACTER_SPRITE_URL,
  DASH_SPEED_MULT,
  ENDLESS_BASE_SPEED,
  ENDLESS_MAX_SPEED,
  ENDLESS_SPEEDUP_SCORE,
  ENDLESS_SPEEDUP_STEP,
} from '../constants';

const ENDLESS_MAX_LIVES = 3;

// 无尽模式配方: 障碍混合 + 少量道具
const ENDLESS_POOL: ObstaclePoolEntry[] = [
  { type: 'icecream', weight: 3, minGap: 240 },
  { type: 'log', weight: 3, minGap: 280 },
  { type: 'sprite', weight: 2, minGap: 260 },
  { type: 'paper', weight: 2, minGap: 250 },
  { type: 'guitar', weight: 2, minGap: 300 },
  { type: 'heart', weight: 1, minGap: 320 },
  { type: 'book', weight: 1, minGap: 340 },
  { type: 'ambulance', weight: 1, minGap: 340 },
];

export class EndlessScene extends Scene {
  private sprite: SpriteLoader;
  private player: Player;
  private entities = new EntityManager();
  private score = new ScoreManager();
  private speed = ENDLESS_BASE_SPEED;
  private lives = ENDLESS_MAX_LIVES;
  private invuln = 0;
  private finished = false;
  private startDelay = 0.6;
  private effects = new GameEffects('#f0e6f5', '#d8c8a0', '#ffffff');

  constructor(game: Game) {
    super(game);
    this.sprite = new SpriteLoader(CHARACTER_SPRITE_URL);
    this.player = new Player(this.sprite);
  }

  enter(): void {
    this.player.reset();
    this.entities.reset();
    this.score.reset();
    this.effects.reset();
    this.speed = ENDLESS_BASE_SPEED;
    this.lives = ENDLESS_MAX_LIVES;
    this.invuln = 0;
    this.finished = false;
    this.startDelay = 0.6;
    AudioManager.playBgm('level');
  }

  update(dt: number, input: InputState): void {
    if (this.finished) return;
    this.player.update(dt, input.jump, input.slide);
    const ev = this.effects.consumePlayerEvents(this.player);
    if (ev.jumped) AudioManager.play('jump');
    if (ev.slid) AudioManager.play('slide');
    if (ev.hit) AudioManager.play('hit');

    // 救护车致命冲刺结束 => 扣光体力, 结束本局
    if (this.player.evtFatalDash) {
      this.player.evtFatalDash = false;
      this.lives = 0;
      this.finish('ambulance');
      return;
    }

    if (this.startDelay > 0) {
      this.effects.update(dt, this.speed * 0.3);
      this.startDelay -= dt;
      return;
    }

    // 按得分档位提速: 每 1000 分 +0.2 倍率(1.2x, 1.4x, 1.6x ...)
    const tier = Math.floor(this.score.total / ENDLESS_SPEEDUP_SCORE);
    const mult = 1 + tier * ENDLESS_SPEEDUP_STEP;
    this.speed = Math.min(ENDLESS_MAX_SPEED, ENDLESS_BASE_SPEED * mult);
    // 障碍密度随档位提升: 每档收紧 8% 间距, 最密到 0.5(后期越来越密集)
    const gapScale = Math.max(0.5, 1 - tier * 0.08);

    const moveSpeed = this.player.isDashing ? this.speed * DASH_SPEED_MULT : this.speed;
    this.effects.update(dt, moveSpeed);
    this.entities.update(dt, moveSpeed, this.player.x, ENDLESS_POOL, gapScale);
    this.score.addDistance(moveSpeed * dt);
    if (this.invuln > 0) this.invuln -= dt;

    const r = resolveInteractions(this.player, this.entities.active, this.invuln > 0);
    if (r.healed && this.lives < ENDLESS_MAX_LIVES) this.lives++;
    if (r.obstacleHit) {
      this.lives--;
      this.invuln = 1.0;
      this.player.hit();
      this.score.onHit();
      if (this.lives <= 0) {
        this.finish(r.hitKind);
        return;
      }
    }

    // 连击计分: 障碍越过玩家且未撞击
    for (const o of this.entities.active) {
      if (o.spec.category !== 'obstacle') continue;
      if (!o.scored && o.x + o.w < this.player.x) {
        this.score.onAvoid();
        o.scored = true;
        AudioManager.play(this.score.combo > 1 ? 'combo' : 'pass');
      }
    }
  }

  private finish(deathKind: EntityKind | null = null): void {
    this.finished = true;
    const finalScore = this.score.total;
    const prevHigh = getHighScore();
    setHighScore(finalScore);
    const isNewRecord = finalScore > prevHigh;
    const record = isNewRecord
      ? '🎉 新纪录!'
      : `最高分 ${Math.max(prevHigh, finalScore)}`;
    this.game.setScene(
      new ResultScene(this.game, {
        title: deathMessage(deathKind),
        subtitle: `得分 ${finalScore}`,
        won: isNewRecord,
        primaryLabel: '再来一局',
        extraLine: record,
        onPrimary: () => this.game.setScene(new EndlessScene(this.game)),
        onBack: () => {
          this.game.setScene(new MenuScene(this.game));
        },
      })
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    const shake = this.effects.shakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    this.effects.background.render(ctx);
    this.entities.render(ctx);
    this.player.render(ctx);
    this.effects.particles.render(ctx);

    ctx.restore();

    // HUD
    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 30px Zpix, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.score.total}`, 24, 46);
    ctx.font = '18px Zpix, system-ui, sans-serif';
    ctx.fillStyle = '#6b6375';
    ctx.fillText('得分', 24, 66);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e67e22';
    ctx.font = 'bold 26px Zpix, system-ui, sans-serif';
    if (this.score.combo > 1) {
      ctx.fillText(
        `连击 ${this.score.combo}　x${this.score.multiplier.toFixed(1)}`,
        GAME_WIDTH / 2,
        46
      );
    }

    drawLives(ctx, this.lives, GAME_WIDTH - 24, 26);

    if (this.startDelay > 0) drawControlHint(ctx, GAME_WIDTH, GAME_HEIGHT);
  }
}
