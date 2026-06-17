import { Scene } from './Scene';
import type { Game } from '../Game';
import type { InputState } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { makeButton, drawButton, hitButton, type Button } from './ui';

export interface ResultOptions {
  title: string;
  subtitle: string;
  won: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
  extraLine?: string;
}

// 通用结算页(关卡通关/失败、无尽模式结束共用)。
export class ResultScene extends Scene {
  private btnPrimary: Button;
  private btnBack: Button;
  private opts: ResultOptions;

  constructor(game: Game, opts: ResultOptions) {
    super(game);
    this.opts = opts;
    const cx = GAME_WIDTH / 2;
    this.btnPrimary = makeButton(cx - 160, 400, 320, 70, opts.primaryLabel);
    this.btnBack = makeButton(cx - 160, 490, 320, 64, '返回菜单');
  }

  update(_dt: number, _input: InputState): void {
    const tap = this.game.input.consumeTap();
    if (!tap) return;
    if (hitButton(this.btnPrimary, tap)) this.opts.onPrimary();
    else if (hitButton(this.btnBack, tap)) this.opts.onBack();
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.opts.won ? '#d6f0d2' : '#f5dcdc';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = this.opts.won ? '#1e8449' : '#c0392b';
    // 标题字号按长度自适应, 避免长死因文字溢出
    const titleSize = this.opts.title.length > 6 ? 60 : 80;
    ctx.font = `bold ${titleSize}px Zpix, system-ui, sans-serif`;
    ctx.fillText(this.opts.title, GAME_WIDTH / 2, 230);

    ctx.fillStyle = '#08060d';
    ctx.font = '32px Zpix, system-ui, sans-serif';
    ctx.fillText(this.opts.subtitle, GAME_WIDTH / 2, 300);

    if (this.opts.extraLine) {
      ctx.fillStyle = '#6b6375';
      ctx.font = '24px Zpix, system-ui, sans-serif';
      ctx.fillText(this.opts.extraLine, GAME_WIDTH / 2, 345);
    }

    drawButton(ctx, this.btnPrimary, { fill: this.opts.won ? '#27ae60' : '#e74c3c' });
    drawButton(ctx, this.btnBack, { fill: '#95a5a6' });
  }
}
