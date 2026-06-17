import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../constants';
import { makeButton, drawButton, hitButton, type Button } from './ui';
import { LEVELS } from '../config/levels';
import { getProgress, setProgress } from '../systems/Storage';
import { GameScene } from './GameScene';
import { ResultScene } from './ResultScene';
import { MenuScene } from './MenuScene';

export class LevelSelectScene extends Scene {
  private levelButtons: { btn: Button; id: number }[] = [];
  private btnBack: Button;

  constructor(game: Game) {
    super(game);
    const progress = getProgress();
    const cols = 3;
    const bw = 220;
    const bh = 130;
    const gapX = 60;
    const gapY = 50;
    const totalW = cols * bw + (cols - 1) * gapX;
    const startX = (GAME_WIDTH - totalW) / 2;
    const startY = 200;

    LEVELS.forEach((lv, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (bw + gapX);
      const y = startY + row * (bh + gapY);
      // 解锁规则: 已通关关卡的下一关可玩(第1关默认解锁)
      const unlocked = lv.id <= progress + 1;
      this.levelButtons.push({
        btn: makeButton(x, y, bw, bh, `${lv.id}`, unlocked),
        id: lv.id,
      });
    });

    this.btnBack = makeButton(40, 40, 120, 56, '← 返回');
  }

  update(_dt: number, _input: InputState): void {
    const tap = this.game.input.consumeTap();
    if (!tap) return;

    if (hitButton(this.btnBack, tap)) {
      this.game.setScene(new MenuScene(this.game));
      return;
    }

    for (const lb of this.levelButtons) {
      if (hitButton(lb.btn, tap)) {
        this.startLevel(lb.id);
        return;
      }
    }
  }

  private startLevel(id: number): void {
    const config = LEVELS.find((l) => l.id === id)!;
    this.game.setScene(
      new GameScene(this.game, config, (result) => {
        if (result.won) setProgress(result.config.id);
        this.game.setScene(
          new ResultScene(this.game, {
            title: result.won ? '通关！' : '失败',
            subtitle: `${result.config.name}　${result.meters}m`,
            won: result.won,
            primaryLabel: result.won ? '下一关' : '重试',
            onPrimary: () => {
              const nextId = result.won ? id + 1 : id;
              const next = LEVELS.find((l) => l.id === nextId);
              if (next) this.startLevel(nextId);
              else this.game.setScene(new LevelSelectScene(this.game));
            },
            onBack: () => this.game.setScene(new LevelSelectScene(this.game)),
          })
        );
      })
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#cfe8f5';
    ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
    ctx.fillStyle = '#e9d8a6';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    ctx.fillStyle = '#08060d';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', GAME_WIDTH / 2, 130);

    drawButton(ctx, this.btnBack, { fill: '#95a5a6', font: 'bold 24px system-ui' });

    for (const lb of this.levelButtons) {
      drawButton(ctx, lb.btn, {
        fill: lb.btn.enabled ? '#3498db' : '#b9b6bf',
        font: 'bold 56px system-ui, sans-serif',
        text: lb.btn.enabled ? '#fff' : '#7a7783',
      });
      if (!lb.btn.enabled) {
        ctx.fillStyle = '#7a7783';
        ctx.font = '26px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          '🔒',
          lb.btn.rect.x + lb.btn.rect.w - 28,
          lb.btn.rect.y + 34
        );
      }
    }
  }
}
