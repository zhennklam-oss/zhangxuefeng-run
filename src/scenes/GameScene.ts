import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState, LevelConfig } from '../types';
import { Player } from '../entities/Player';
import { EntityManager } from '../entities/EntityManager';
import { SpriteLoader } from '../systems/SpriteLoader';
import { LevelManager } from '../systems/LevelManager';
import { GameEffects } from '../systems/GameEffects';
import { AudioManager } from '../systems/AudioManager';
import { resolveInteractions } from '../systems/Interactions';
import { drawControlHint, drawLives } from './ui';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  CHARACTER_SPRITE_URL,
  DASH_SPEED_MULT,
} from '../constants';

export interface LevelResult {
  config: LevelConfig;
  won: boolean;
  meters: number;
}

type ResultCallback = (result: LevelResult) => void;

// 关卡模式核心场景。由 LevelConfig 驱动。
export class GameScene extends Scene {
  private sprite: SpriteLoader;
  private player: Player;
  private entities = new EntityManager();
  private level: LevelManager;
  private config: LevelConfig;
  private effects: GameEffects;
  private lives: number;
  private invuln = 0;
  private onResult: ResultCallback;
  private finished = false;
  private startDelay = 0.6; // 起跑停留,期间不生成障碍

  constructor(game: Game, config: LevelConfig, onResult: ResultCallback) {
    super(game);
    this.config = config;
    this.onResult = onResult;
    this.level = new LevelManager(config);
    this.lives = config.lives;
    this.sprite = new SpriteLoader(CHARACTER_SPRITE_URL);
    this.player = new Player(this.sprite);
    this.effects = new GameEffects(
      config.backgroundColor,
      config.groundColor,
      config.cloudColor
    );
  }

  enter(): void {
    this.player.reset();
    this.entities.reset();
    this.effects.reset();
    this.lives = this.config.lives;
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

    // 救护车致命冲刺结束 => 扣光体力, 本局失败
    if (this.player.evtFatalDash) {
      this.player.evtFatalDash = false;
      this.lives = 0;
      this.finish(false);
      return;
    }

    const baseSpeed = this.startDelay > 0 ? 0 : this.level.currentSpeed;
    const speed = this.player.isDashing ? baseSpeed * DASH_SPEED_MULT : baseSpeed;
    this.effects.update(dt, speed || this.config.baseSpeed * 0.3);

    if (this.startDelay > 0) {
      this.startDelay -= dt;
      return;
    }

    this.level.advance(this.player.isDashing ? dt * DASH_SPEED_MULT : dt);
    this.entities.update(dt, speed, this.player.x, this.config.obstaclePool);

    if (this.invuln > 0) this.invuln -= dt;

    const r = resolveInteractions(this.player, this.entities.active, this.invuln > 0);
    if (r.healed && this.lives < this.config.lives) this.lives++;
    if (r.obstacleHit) {
      this.lives--;
      this.invuln = 1.0;
      this.player.hit();
      if (this.lives <= 0) {
        this.finish(false);
        return;
      }
    }

    if (this.level.isComplete) this.finish(true);
  }

  private finish(won: boolean): void {
    this.finished = true;
    if (won) AudioManager.play('pass');
    this.onResult({ config: this.config, won, meters: this.level.meters });
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
    this.renderHud(ctx);
    if (this.startDelay > 0) drawControlHint(ctx, GAME_WIDTH, GAME_HEIGHT);
  }

  private renderHud(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${this.config.name}  ${this.level.meters}/${this.config.distance}m`,
      24,
      42
    );

    // 体力(爱心图标)
    drawLives(ctx, this.lives, GAME_WIDTH - 24, 26);

    // 进度条
    const barW = GAME_WIDTH - 48;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(24, 56, barW, 8);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(24, 56, barW * this.level.progress, 8);
    ctx.textAlign = 'left';
  }
}
