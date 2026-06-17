import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState, ObstaclePoolEntry } from '../types';
import { Player } from '../entities/Player';
import { ObstacleManager } from '../entities/ObstacleManager';
import { SpriteLoader } from '../systems/SpriteLoader';
import { ScoreManager } from '../systems/ScoreManager';
import { GameEffects } from '../systems/GameEffects';
import { AudioManager } from '../systems/AudioManager';
import { aabbOverlap } from '../systems/CollisionSystem';
import { setHighScore, getHighScore } from '../systems/Storage';
import { ResultScene } from './ResultScene';
import { MenuScene } from './MenuScene';
import { drawControlHint } from './ui';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  CHARACTER_SPRITE_URL,
  ENDLESS_BASE_SPEED,
  ENDLESS_MAX_SPEED,
  ENDLESS_SPEEDUP_INTERVAL,
  ENDLESS_SPEEDUP_AMOUNT,
} from '../constants';

// 无尽模式障碍配方(全类型混合)
const ENDLESS_POOL: ObstaclePoolEntry[] = [
  { type: 'qiaolezi', weight: 3, minGap: 240 },
  { type: 'gunmu', weight: 3, minGap: 250 },
  { type: 'xuebi', weight: 2, minGap: 260 },
  { type: 'shijuan', weight: 2, minGap: 240 },
  { type: 'maikefeng', weight: 2, minGap: 270 },
];

export class EndlessScene extends Scene {
  private sprite: SpriteLoader;
  private player: Player;
  private obstacles = new ObstacleManager();
  private score = new ScoreManager();
  private speed = ENDLESS_BASE_SPEED;
  private elapsed = 0;
  private speedupTimer = 0;
  private lives = 3;
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
    this.obstacles.reset();
    this.score.reset();
    this.effects.reset();
    this.speed = ENDLESS_BASE_SPEED;
    this.elapsed = 0;
    this.speedupTimer = 0;
    this.lives = 3;
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

    if (this.startDelay > 0) {
      this.effects.update(dt, this.speed * 0.3);
      this.startDelay -= dt;
      return;
    }

    this.elapsed += dt;
    this.speedupTimer += dt;
    if (this.speedupTimer >= ENDLESS_SPEEDUP_INTERVAL) {
      this.speedupTimer -= ENDLESS_SPEEDUP_INTERVAL;
      this.speed = Math.min(ENDLESS_MAX_SPEED, this.speed + ENDLESS_SPEEDUP_AMOUNT);
    }

    this.effects.update(dt, this.speed);
    this.obstacles.update(dt, this.speed, ENDLESS_POOL);
    this.score.addDistance(this.speed * dt);
    if (this.invuln > 0) this.invuln -= dt;

    const pbox = this.player.getHitbox();
    for (const o of this.obstacles.active) {
      // 碰撞
      if (this.invuln <= 0 && !o.scored && aabbOverlap(pbox, o.getHitbox())) {
        this.lives--;
        this.invuln = 1.0;
        this.player.hit();
        this.score.onHit();
        o.scored = true; // 标记已结算,避免重复
        if (this.lives <= 0) {
          this.finish();
          return;
        }
        continue;
      }
      // 成功躲避: 障碍越过玩家且未被判定撞击
      if (!o.scored && o.x + o.w < this.player.x) {
        this.score.onAvoid();
        o.scored = true;
        AudioManager.play(this.score.combo > 1 ? 'combo' : 'pass');
      }
    }
  }

  private finish(): void {
    this.finished = true;
    const finalScore = this.score.total;
    const prevHigh = getHighScore();
    setHighScore(finalScore);
    const isNewRecord = finalScore > prevHigh;
    this.game.setScene(
      new ResultScene(this.game, {
        title: '游戏结束',
        subtitle: `得分 ${finalScore}`,
        won: isNewRecord,
        primaryLabel: '再来一局',
        extraLine: isNewRecord
          ? '🎉 新纪录!'
          : `最高分 ${Math.max(prevHigh, finalScore)}`,
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
    this.obstacles.render(ctx);
    this.player.render(ctx);
    this.effects.particles.render(ctx);

    ctx.restore();

    // HUD
    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.score.total}`, 24, 46);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#6b6375';
    ctx.fillText('得分', 24, 66);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e67e22';
    ctx.font = 'bold 26px system-ui, sans-serif';
    if (this.score.combo > 1) {
      ctx.fillText(
        `连击 ${this.score.combo}　x${this.score.multiplier.toFixed(1)}`,
        GAME_WIDTH / 2,
        46
      );
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(`生命 ${'♥'.repeat(Math.max(0, this.lives))}`, GAME_WIDTH - 24, 46);
    ctx.textAlign = 'left';

    if (this.startDelay > 0) drawControlHint(ctx, GAME_WIDTH, GAME_HEIGHT);
  }
}
