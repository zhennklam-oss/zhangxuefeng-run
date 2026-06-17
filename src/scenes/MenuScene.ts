import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../constants';
import { makeButton, drawButton, hitButton, drawClouds, type Button } from './ui';
import { LevelSelectScene } from './LevelSelectScene';
import { EndlessScene } from './EndlessScene';
import { getProgress, getHighScore } from '../systems/Storage';
import { AudioManager } from '../systems/AudioManager';
import { TOTAL_LEVELS } from '../config/levels';

export class MenuScene extends Scene {
  private btnStart: Button;
  private btnEndless: Button;
  private btnMute: Button;
  private t = 0;

  constructor(game: Game) {
    super(game);
    const cx = GAME_WIDTH / 2;
    this.btnStart = makeButton(cx - 160, 340, 320, 72, '开始闯关');
    const endlessUnlocked = getProgress() >= TOTAL_LEVELS;
    this.btnEndless = makeButton(
      cx - 160,
      436,
      320,
      72,
      endlessUnlocked ? '无尽模式' : '无尽模式 🔒',
      endlessUnlocked
    );
    this.btnMute = makeButton(GAME_WIDTH - 84, 28, 56, 56, '🔊');
  }

  enter(): void {
    const unlocked = getProgress() >= TOTAL_LEVELS;
    this.btnEndless.enabled = unlocked;
    this.btnEndless.label = unlocked ? '无尽模式' : '无尽模式 🔒';
    this.btnMute.label = AudioManager.isMuted ? '🔇' : '🔊';
    AudioManager.playBgm('menu');
  }

  update(_dt: number, _input: InputState): void {
    this.t += _dt;
    const tap = this.game.input.consumeTap();
    if (!tap) return;
    if (hitButton(this.btnMute, tap)) {
      const muted = AudioManager.toggleMute();
      this.btnMute.label = muted ? '🔇' : '🔊';
    } else if (hitButton(this.btnStart, tap)) {
      this.game.setScene(new LevelSelectScene(this.game));
    } else if (hitButton(this.btnEndless, tap)) {
      this.game.setScene(new EndlessScene(this.game));
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#cfe8f5';
    ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
    ctx.fillStyle = '#e9d8a6';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    drawClouds(ctx, '#ffffff', GAME_WIDTH);

    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('张雪峰快跑', GAME_WIDTH / 2, 230);

    ctx.font = '22px system-ui, sans-serif';
    ctx.fillStyle = '#6b6375';
    ctx.fillText('W/↑ 跳跃　·　S/↓ 滑铲', GAME_WIDTH / 2, 285);

    drawButton(ctx, this.btnStart);
    drawButton(ctx, this.btnEndless);
    drawButton(ctx, this.btnMute, { fill: '#95a5a6', font: '28px system-ui' });

    const hs = getHighScore();
    if (hs > 0) {
      ctx.fillStyle = '#6b6375';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(`无尽最高分 ${hs}`, GAME_WIDTH / 2, 545);
    }
  }
}
